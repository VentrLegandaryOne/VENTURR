import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, MapPin, DollarSign, X } from "lucide-react";
import { format } from "date-fns";

interface PortfolioProject {
  id: number;
  title: string;
  description?: string | null;
  projectType: string;
  location?: string | null;
  beforePhotoUrl?: string | null;
  afterPhotoUrl: string;
  additionalPhotos?: Array<{ url: string; caption?: string }> | null;
  completionDate?: Date | null;
  projectCost?: number | null;
  duration?: number | null;
  clientTestimonial?: string | null;
}

interface PortfolioGalleryProps {
  projects: PortfolioProject[];
}

export function PortfolioGallery({ projects }: PortfolioGalleryProps) {
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (projects.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Portfolio</span>
            <Badge variant="secondary">{projects.length} Projects</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                {/* Before/After Photo Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3 rounded-lg overflow-hidden">
                  {project.beforePhotoUrl && (
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={project.beforePhotoUrl}
                        alt={`${project.title} - Before`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Before
                      </div>
                    </div>
                  )}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={project.afterPhotoUrl}
                      alt={`${project.title} - After`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 bg-[#10B981]/90 text-white text-xs px-2 py-1 rounded">
                      After
                    </div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold text-lg group-hover:text-[#00A8FF] transition-colors">
                      {project.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {project.projectType}
                    </Badge>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {project.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </div>
                    )}
                    {project.completionDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(project.completionDate), "MMM yyyy")}
                      </div>
                    )}
                    {project.projectCost && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${(project.projectCost / 100).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Detail Modal */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedProject.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge>{selectedProject.projectType}</Badge>
                  {selectedProject.location && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedProject.location}
                    </Badge>
                  )}
                  {selectedProject.completionDate && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(selectedProject.completionDate), "MMM yyyy")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Before/After Photos */}
              <div className="grid grid-cols-2 gap-4">
                {selectedProject.beforePhotoUrl && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Before</p>
                    <img
                      src={selectedProject.beforePhotoUrl}
                      alt="Before"
                      className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setLightboxImage(selectedProject.beforePhotoUrl!)}
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium mb-2 text-[#10B981]">After</p>
                  <img
                    src={selectedProject.afterPhotoUrl}
                    alt="After"
                    className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxImage(selectedProject.afterPhotoUrl)}
                  />
                </div>
              </div>

              {/* Additional Photos */}
              {selectedProject.additionalPhotos && selectedProject.additionalPhotos.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Additional Photos</p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedProject.additionalPhotos.map((photo, index) => (
                      <div key={index}>
                        <img
                          src={photo.url}
                          alt={photo.caption || `Photo ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setLightboxImage(photo.url)}
                        />
                        {photo.caption && (
                          <p className="text-xs text-muted-foreground mt-1">{photo.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedProject.description && (
                <div>
                  <p className="text-sm font-medium mb-2">Project Details</p>
                  <p className="text-muted-foreground">{selectedProject.description}</p>
                </div>
              )}

              {/* Project Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {selectedProject.projectCost && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Project Value</p>
                    <p className="text-lg font-semibold">
                      ${(selectedProject.projectCost / 100).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedProject.duration && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="text-lg font-semibold">
                      {selectedProject.duration} {selectedProject.duration === 1 ? "day" : "days"}
                    </p>
                  </div>
                )}
                {selectedProject.completionDate && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-lg font-semibold">
                      {format(new Date(selectedProject.completionDate), "MMM yyyy")}
                    </p>
                  </div>
                )}
              </div>

              {/* Client Testimonial */}
              {selectedProject.clientTestimonial && (
                <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-[#10B981]">
                  <p className="text-sm font-medium mb-2">Client Feedback</p>
                  <p className="text-muted-foreground italic">
                    "{selectedProject.clientTestimonial}"
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Lightbox for full-size images */}
      {lightboxImage && (
        <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <img
              src={lightboxImage}
              alt="Full size"
              className="w-full h-full object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
