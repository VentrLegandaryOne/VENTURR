import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin, Phone, Mail, Globe, Shield, Award, SlidersHorizontal, X } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ComparisonBar } from "@/components/ComparisonBar";
import { AddToCompareButton } from "@/components/AddToCompareButton";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

const PROJECT_TYPES = [
  "Renovation",
  "New Build",
  "Repair",
  "Commercial",
  "Residential",
  "Industrial",
];

export default function Contractors() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [ratingRange, setRatingRange] = useState<[number, number]>([
    parseFloat(searchParams.get("minRating") || "0"),
    parseFloat(searchParams.get("maxRating") || "5"),
  ]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>(
    searchParams.get("types")?.split(",").filter(Boolean) || []
  );
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (showVerifiedOnly) params.set("verified", "true");
    if (ratingRange[0] > 0) params.set("minRating", ratingRange[0].toString());
    if (ratingRange[1] < 5) params.set("maxRating", ratingRange[1].toString());
    if (selectedProjectTypes.length > 0) params.set("types", selectedProjectTypes.join(","));

    const newSearch = params.toString();
    const currentPath = window.location.pathname;
    setLocation(`${currentPath}${newSearch ? `?${newSearch}` : ""}`, { replace: true });
  }, [searchQuery, showVerifiedOnly, ratingRange, selectedProjectTypes, setLocation]);

  const { data: contractors = [], isLoading, error: errorContractors } = trpc.contractors.list.useQuery({
    limit: 50,
    verified: showVerifiedOnly || undefined,
  }, { retry: 2 });

  // Apply filters
  const filteredContractors = contractors.filter((c) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(query) ||
        c.licenseNumber?.toLowerCase().includes(query) ||
        c.businessName?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Rating filter
    const rating = (c.avgScore || 0) / 20; // Convert 0-100 to 0-5
    if (rating < ratingRange[0] || rating > ratingRange[1]) return false;

    // Project type filter
    if (selectedProjectTypes.length > 0) {
      // Check if contractor has any of the selected project types
      // This is a simplified check - in production, you'd query the contractor_projects table
      const specialtiesStr = Array.isArray(c.specialties) 
        ? c.specialties.join(",").toLowerCase() 
        : (c.specialties || "").toLowerCase();
      const hasMatchingType = selectedProjectTypes.some((type) =>
        specialtiesStr.includes(type.toLowerCase())
      );
      if (!hasMatchingType) return false;
    }

    return true;
  });

  const renderStars = (score: number) => {
    const rating = score / 20; // Convert 0-100 to 0-5
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars
                ? "fill-[#F97316] text-[#F97316]"
                : i === fullStars && hasHalfStar
                  ? "fill-[#F97316]/50 text-[#F97316]"
                  : "text-muted-foreground/30"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setShowVerifiedOnly(false);
    setRatingRange([0, 5]);
    setSelectedProjectTypes([]);
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (showVerifiedOnly ? 1 : 0) +
    (ratingRange[0] > 0 || ratingRange[1] < 5 ? 1 : 0) +
    (selectedProjectTypes.length > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 triangle-pattern pt-24 pb-16">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
            Contractor Directory
          </h1>
          <p className="text-slate-400 text-lg">
            Find verified contractors with proven track records
          </p>
        </div>

        {/* Search & Filter Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by name, license, or business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-1 bg-primary text-primary-foreground">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="glass-strong border-slate-700/50 mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-white">Advanced Filters</CardTitle>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="gap-2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verified Only Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={showVerifiedOnly}
                  onCheckedChange={(checked) => setShowVerifiedOnly(checked === true)}
                  className="border-slate-600"
                />
                <Label
                  htmlFor="verified"
                  className="text-sm font-medium text-slate-300 cursor-pointer flex items-center gap-2"
                >
                  <Shield className="h-4 w-4 text-[#00A8FF]" />
                  Show Verified Contractors Only
                </Label>
              </div>

              {/* Rating Range Slider */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-300">
                  Rating Range: {ratingRange[0].toFixed(1)} - {ratingRange[1].toFixed(1)} stars
                </Label>
                <Slider
                  min={0}
                  max={5}
                  step={0.5}
                  value={ratingRange}
                  onValueChange={(value) => setRatingRange(value as [number, number])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0 stars</span>
                  <span>5 stars</span>
                </div>
              </div>

              {/* Project Type Checkboxes */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-300">Project Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PROJECT_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedProjectTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProjectTypes([...selectedProjectTypes, type]);
                          } else {
                            setSelectedProjectTypes(
                              selectedProjectTypes.filter((t) => t !== type)
                            );
                          }
                        }}
                        className="border-slate-600"
                      />
                      <Label
                        htmlFor={`type-${type}`}
                        className="text-sm text-slate-400 cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-4 text-slate-400">
          Showing {filteredContractors.length} of {contractors.length} contractors
        </div>

        {/* Contractors Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : filteredContractors.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No contractors found"
            description={
              activeFiltersCount > 0
                ? "Try adjusting your filters or search criteria"
                : "No contractors available at the moment"
            }
            onAction={activeFiltersCount > 0 ? handleClearFilters : undefined}
            actionLabel={activeFiltersCount > 0 ? "Clear Filters" : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContractors.map((contractor) => (
              <Link key={contractor.id} href={`/contractor/${contractor.id}`}>
                <Card className="glass-strong border-slate-700/50 hover:border-[#00A8FF]/50 hover:glow-primary transition-smooth cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-white text-lg">
                        {contractor.businessName || contractor.name}
                      </CardTitle>
                      {contractor.isVerified && (
                        <Badge
                          variant="default"
                          className="bg-[#00A8FF] text-white gap-1"
                        >
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {renderStars(contractor.avgScore || 0)}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contractor.licenseNumber && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Award className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">License: {contractor.licenseNumber}</span>
                      </div>
                    )}
                    {contractor.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{contractor.address}</span>
                      </div>
                    )}
                    {contractor.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{contractor.phone}</span>
                      </div>
                    )}
                    {contractor.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{contractor.email}</span>
                      </div>
                    )}
                    {contractor.website && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{contractor.website}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                      <span>{contractor.totalReviews || 0} reviews</span>
                      <span>{contractor.totalProjects || 0} projects</span>
                    </div>
                    <div className="pt-3" onClick={(e) => e.preventDefault()}>
                      <AddToCompareButton contractorId={contractor.id} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <ComparisonBar />
    </div>
  );
}