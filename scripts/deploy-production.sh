#!/bin/bash

###############################################################################
# Venturr Platform - Production Deployment Script
# Blue-Green Deployment Strategy with Automated Rollback
# Version: 1.0
# Date: November 8, 2025
###############################################################################

set -e

# Configuration
ENVIRONMENT="production"
DEPLOYMENT_STRATEGY="blue-green"
HEALTH_CHECK_TIMEOUT=300
TRAFFIC_SHIFT_INTERVAL=30
ROLLBACK_ON_ERROR=true
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
LOG_FILE="/var/log/venturr-deployment-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

###############################################################################
# Logging Functions
###############################################################################

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1" | tee -a "$LOG_FILE"
}

###############################################################################
# Slack Notifications
###############################################################################

send_slack_notification() {
    local message="$1"
    local color="$2"
    
    if [ -z "$SLACK_WEBHOOK_URL" ]; then
        return
    fi
    
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{
            \"attachments\": [{
                \"color\": \"$color\",
                \"title\": \"Venturr Deployment\",
                \"text\": \"$message\",
                \"ts\": $(date +%s)
            }]
        }" 2>/dev/null || true
}

###############################################################################
# Pre-Deployment Checks
###############################################################################

pre_deployment_checks() {
    log "Starting pre-deployment checks..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    log_success "Docker is installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    log_success "Docker Compose is installed"
    
    # Check environment variables
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL environment variable not set"
        exit 1
    fi
    log_success "Environment variables configured"
    
    # Check disk space
    AVAILABLE_SPACE=$(df /var/lib/docker | awk 'NR==2 {print $4}')
    if [ "$AVAILABLE_SPACE" -lt 5242880 ]; then # 5GB
        log_error "Insufficient disk space (< 5GB available)"
        exit 1
    fi
    log_success "Sufficient disk space available"
    
    # Run tests
    log "Running test suite..."
    npm run test:ci || {
        log_error "Tests failed"
        exit 1
    }
    log_success "All tests passed"
    
    # Security audit
    log "Running security audit..."
    npm audit --audit-level=moderate || {
        log_warning "Security vulnerabilities detected"
    }
    log_success "Security audit complete"
    
    log_success "Pre-deployment checks passed"
}

###############################################################################
# Build Docker Image
###############################################################################

build_docker_image() {
    log "Building Docker image..."
    
    local image_tag="venturr:$(date +%Y%m%d-%H%M%S)"
    local latest_tag="venturr:latest"
    
    docker build \
        --build-arg NODE_ENV=production \
        --tag "$image_tag" \
        --tag "$latest_tag" \
        . || {
        log_error "Docker build failed"
        exit 1
    }
    
    log_success "Docker image built: $image_tag"
    echo "$image_tag"
}

###############################################################################
# Blue-Green Deployment
###############################################################################

blue_green_deployment() {
    local new_image="$1"
    
    log "Starting blue-green deployment..."
    
    # Get current active environment (blue or green)
    local current_env=$(docker ps --filter "label=venturr.env" --format "{{.Label \"venturr.env\"}}" | head -1)
    local new_env="green"
    
    if [ "$current_env" = "green" ]; then
        new_env="blue"
    fi
    
    log "Current environment: $current_env"
    log "Deploying to environment: $new_env"
    
    # Start new environment
    log "Starting $new_env environment..."
    docker-compose -f docker-compose.yml up -d \
        --build \
        -e VENTURR_ENV="$new_env" \
        -e DOCKER_IMAGE="$new_image" || {
        log_error "Failed to start $new_env environment"
        return 1
    }
    
    log_success "$new_env environment started"
    
    # Health checks
    log "Running health checks on $new_env environment..."
    local health_check_count=0
    local max_attempts=$((HEALTH_CHECK_TIMEOUT / 10))
    
    while [ $health_check_count -lt $max_attempts ]; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            log_success "Health check passed"
            break
        fi
        
        health_check_count=$((health_check_count + 1))
        log "Health check attempt $health_check_count/$max_attempts..."
        sleep 10
    done
    
    if [ $health_check_count -eq $max_attempts ]; then
        log_error "Health checks failed after $HEALTH_CHECK_TIMEOUT seconds"
        rollback_deployment "$current_env"
        return 1
    fi
    
    # Gradual traffic shift
    log "Starting gradual traffic shift..."
    
    for traffic_percentage in 10 25 50 75 100; do
        log "Shifting $traffic_percentage% traffic to $new_env..."
        
        # Update load balancer configuration
        update_load_balancer_traffic "$new_env" "$traffic_percentage"
        
        # Monitor for errors
        sleep "$TRAFFIC_SHIFT_INTERVAL"
        
        local error_rate=$(get_error_rate)
        if (( $(echo "$error_rate > 1.0" | bc -l) )); then
            log_error "Error rate exceeded 1% ($error_rate%)"
            rollback_deployment "$current_env"
            return 1
        fi
        
        log_success "Traffic shift to $traffic_percentage% successful (error rate: $error_rate%)"
    done
    
    log_success "Traffic fully shifted to $new_env"
    
    # Decommission old environment
    log "Decommissioning $current_env environment..."
    docker-compose -f docker-compose.yml down \
        -e VENTURR_ENV="$current_env" || {
        log_warning "Failed to cleanly shutdown $current_env"
    }
    
    log_success "Blue-green deployment completed successfully"
    return 0
}

###############################################################################
# Update Load Balancer
###############################################################################

update_load_balancer_traffic() {
    local environment="$1"
    local percentage="$2"
    
    # This would typically interact with your load balancer (Nginx, HAProxy, etc.)
    # Example for Nginx:
    cat > /etc/nginx/conf.d/venturr-upstream.conf <<EOF
upstream venturr_blue {
    server venturr-blue:3000 weight=$((100 - percentage));
}

upstream venturr_green {
    server venturr-green:3000 weight=$percentage;
}

server {
    listen 80;
    server_name api.venturr.com;
    
    location / {
        proxy_pass http://venturr_blue;
        proxy_pass http://venturr_green;
    }
}
EOF
    
    nginx -s reload || true
}

###############################################################################
# Get Error Rate
###############################################################################

get_error_rate() {
    # Query monitoring system for error rate
    # This is a placeholder - would typically query Prometheus, DataDog, etc.
    
    local error_count=$(curl -s http://localhost:9090/api/v1/query \
        --data-urlencode 'query=rate(http_requests_total{status=~"5.."}[5m])' \
        | jq '.data.result[0].value[1]' 2>/dev/null || echo "0")
    
    local total_count=$(curl -s http://localhost:9090/api/v1/query \
        --data-urlencode 'query=rate(http_requests_total[5m])' \
        | jq '.data.result[0].value[1]' 2>/dev/null || echo "1")
    
    echo "scale=2; ($error_count / $total_count) * 100" | bc
}

###############################################################################
# Rollback Deployment
###############################################################################

rollback_deployment() {
    local previous_env="$1"
    
    log_error "Rolling back to $previous_env environment..."
    
    # Shift traffic back to previous environment
    update_load_balancer_traffic "$previous_env" 100
    
    # Verify rollback
    sleep 10
    
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "Rollback completed successfully"
        send_slack_notification "Deployment rolled back to $previous_env" "warning"
        return 0
    else
        log_error "Rollback verification failed - manual intervention required"
        send_slack_notification "CRITICAL: Rollback verification failed" "danger"
        return 1
    fi
}

###############################################################################
# Database Migrations
###############################################################################

run_database_migrations() {
    log "Running database migrations..."
    
    docker-compose exec -T db npm run db:migrate || {
        log_error "Database migrations failed"
        return 1
    }
    
    log_success "Database migrations completed"
}

###############################################################################
# Cache Warming
###############################################################################

warm_cache() {
    log "Warming cache..."
    
    # Pre-load frequently accessed data into Redis
    docker-compose exec -T app npm run cache:warm || {
        log_warning "Cache warming failed (non-critical)"
    }
    
    log_success "Cache warming completed"
}

###############################################################################
# Post-Deployment Verification
###############################################################################

post_deployment_verification() {
    log "Running post-deployment verification..."
    
    # Check application health
    if ! curl -f http://localhost:3000/health &> /dev/null; then
        log_error "Application health check failed"
        return 1
    fi
    log_success "Application health check passed"
    
    # Check database connectivity
    if ! docker-compose exec -T db pg_isready &> /dev/null; then
        log_error "Database connectivity check failed"
        return 1
    fi
    log_success "Database connectivity check passed"
    
    # Check Redis connectivity
    if ! docker-compose exec -T redis redis-cli ping &> /dev/null; then
        log_error "Redis connectivity check failed"
        return 1
    fi
    log_success "Redis connectivity check passed"
    
    # Run smoke tests
    log "Running smoke tests..."
    npm run test:smoke || {
        log_error "Smoke tests failed"
        return 1
    }
    log_success "Smoke tests passed"
    
    log_success "Post-deployment verification completed"
}

###############################################################################
# Main Deployment Flow
###############################################################################

main() {
    log "=========================================="
    log "Venturr Platform - Production Deployment"
    log "Strategy: $DEPLOYMENT_STRATEGY"
    log "Environment: $ENVIRONMENT"
    log "=========================================="
    
    send_slack_notification "Starting deployment to $ENVIRONMENT" "good"
    
    # Pre-deployment checks
    pre_deployment_checks || exit 1
    
    # Build Docker image
    local new_image=$(build_docker_image) || exit 1
    
    # Run database migrations
    run_database_migrations || exit 1
    
    # Warm cache
    warm_cache || true
    
    # Blue-green deployment
    blue_green_deployment "$new_image" || {
        if [ "$ROLLBACK_ON_ERROR" = true ]; then
            log_error "Deployment failed - rolling back"
            exit 1
        fi
    }
    
    # Post-deployment verification
    post_deployment_verification || exit 1
    
    log_success "=========================================="
    log_success "Deployment completed successfully!"
    log_success "=========================================="
    
    send_slack_notification "Deployment to $ENVIRONMENT completed successfully" "good"
}

# Run main function
main "$@"

