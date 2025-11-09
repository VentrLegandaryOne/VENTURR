#!/usr/bin/env node

/**
 * EXECUTE FIRST AUTONOMOUS VALIDATION CYCLE
 * 
 * This script executes the first autonomous validation cycle to verify
 * that all systems are working correctly and production-ready
 */

import { continuousAutonomousCycle } from '../server/continuousAutonomousCycle.ts';

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║     VENTURR PLATFORM - FIRST AUTONOMOUS CYCLE EXECUTION        ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

try {
  // Start the cycle
  console.log('Starting Continuous Autonomous Cycle...');
  continuousAutonomousCycle.start();
  console.log('✓ Cycle started\n');

  // Execute first cycle
  console.log('Executing first autonomous validation cycle...');
  const execution = await continuousAutonomousCycle.executeAutonomousCycle();

  // Display results
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    CYCLE EXECUTION RESULTS                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`Cycle ID:              ${execution.id}`);
  console.log(`Cycle Number:          ${execution.cycleNumber}`);
  console.log(`Status:                ${execution.status.toUpperCase()}`);
  console.log(`Overall Score:         ${execution.overallScore.toFixed(1)}/10`);
  console.log(`Acceptance Rate:       ${execution.acceptanceRate.toFixed(1)}%`);
  console.log(`Production Ready:      ${execution.productionReady ? '✓ YES' : '✗ NO'}`);
  console.log(`Iterations:            ${execution.iterationCount}`);
  console.log(`Corrections Applied:   ${execution.correctionsApplied}`);
  console.log(`Phases Executed:       ${execution.phases.length}`);
  console.log(`Start Time:            ${execution.startTime.toISOString()}`);
  console.log(`End Time:              ${execution.endTime?.toISOString() || 'N/A'}`);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                       PHASE RESULTS                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  for (const phase of execution.phases) {
    const duration = phase.duration ? `${phase.duration}ms` : 'N/A';
    const status = phase.status === 'completed' ? '✓' : phase.status === 'failed' ? '✗' : '⏳';

    console.log(`${status} ${phase.name.toUpperCase().padEnd(15)} - ${phase.status.padEnd(12)} (${duration})`);

    if (phase.result && Object.keys(phase.result).length > 0) {
      const resultStr = JSON.stringify(phase.result, null, 2);
      const lines = resultStr.split('\n');
      for (const line of lines) {
        console.log(`  ${line}`);
      }
    }
  }

  // Get statistics
  const stats = continuousAutonomousCycle.getCycleStatistics();

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    CYCLE STATISTICS                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`Total Cycles:          ${stats.totalCycles}`);
  console.log(`Completed Cycles:      ${stats.completedCycles}`);
  console.log(`Failed Cycles:         ${stats.failedCycles}`);
  console.log(`Average Score:         ${stats.averageScore.toFixed(2)}/10`);
  console.log(`Average Acceptance:    ${stats.averageAcceptance.toFixed(1)}%`);
  console.log(`Average Iterations:    ${stats.averageIterations.toFixed(1)}`);
  console.log(`Total Corrections:     ${stats.totalCorrections}`);
  console.log(`Production Ready:      ${stats.productionReadyCycles}/${stats.totalCycles}`);

  // Final status
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  if (execution.productionReady) {
    console.log('║  ✓ SYSTEM IS PRODUCTION-READY - READY FOR DEPLOYMENT          ║');
  } else {
    console.log('║  ⚠ SYSTEM NEEDS ATTENTION - CONTINUE REFINEMENT CYCLES       ║');
  }
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  process.exit(0);
} catch (error) {
  console.error('✗ Cycle execution failed:', error);
  process.exit(1);
}

