import type { Project } from '@constants/projects-config';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { STATUS_LABELS, STATUS_STYLES } from './ProjectCard';

interface ProjectDetailDialogProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

/** Default project image SVG */
const DEFAULT_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="100%" height="100%" viewBox="0 0 400 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="200" fill="#f3f4f6"/>
  <rect x="140" y="60" width="120" height="80" rx="12" fill="#e5e7eb"/>
  <rect x="155" y="80" width="40" height="6" rx="3" fill="#9ca3af"/>
  <rect x="155" y="92" width="70" height="6" rx="3" fill="#9ca3af"/>
  <rect x="155" y="104" width="55" height="6" rx="3" fill="#9ca3af"/>
  <circle cx="280" cy="100" r="25" fill="#d1d5db"/>
  <path d="M272 100 L280 90 L288 100 L283 100 L283 112 L277 112 L277 100 Z" fill="#9ca3af"/>
</svg>
`)}`;

export default function ProjectDetailDialog({ project, open, onClose }: ProjectDetailDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {/* Cover Image */}
        {project.image && (
          <div className="relative -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl">
            <img
              src={project.image}
              alt={project.name}
              className="h-48 w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}

        <DialogHeader>
          {/* Title + Status */}
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-xl">{project.name}</DialogTitle>
            <Badge className={STATUS_STYLES[project.status]}>{STATUS_LABELS[project.status]}</Badge>
          </div>

          {/* Description */}
          <DialogDescription className="mt-2 text-base">{project.description}</DialogDescription>
        </DialogHeader>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {project.links.primary && (
            <Button asChild>
              <a href={project.links.primary} target="_blank" rel="noopener noreferrer">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Visit
              </a>
            </Button>
          )}

          {project.links.github && (
            <Button variant="outline" asChild>
              <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
              </a>
            </Button>
          )}

          {project.links.demo && (
            <Button variant="outline" asChild>
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Demo
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
