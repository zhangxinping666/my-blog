import { ErrorBoundary, ErrorFallback } from '@components/common';
import { microDampingPreset } from '@constants/anim/spring';
import { allTags, PROJECT_STATUS, type Project, type ProjectStatus, projectsData } from '@constants/projects-config';
import { cn } from '@lib/utils';
import { motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { Badge } from '../ui/badge';
import ProjectCard from './ProjectCard';
import ProjectDetailDialog from './ProjectDetailDialog';

/** Filter state type - 'all' or a specific status */
type StatusFilter = ProjectStatus | 'all';

export default function ProjectsGrid() {
  // Filter state (local useState, no need for global store)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  // Dialog state (lifted to Grid level, single responsibility)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Toggle tag selection
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedTags([]);
    setSelectedStatus('all');
  }, []);

  // Filter logic
  const filteredProjects = useMemo(() => {
    return projectsData.filter((p) => {
      const tagMatch = selectedTags.length === 0 || selectedTags.some((t) => p.tags.includes(t));
      const statusMatch = selectedStatus === 'all' || p.status === selectedStatus;
      return tagMatch && statusMatch;
    });
  }, [selectedTags, selectedStatus]);

  // Check if any filter is active
  const hasActiveFilters = selectedTags.length > 0 || selectedStatus !== 'all';

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="w-full">
        {/* Filter Bar */}
        <div className="mb-6 space-y-4">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-medium text-gray-500 text-sm dark:text-gray-400">Status:</span>
            <Badge
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              className="cursor-pointer transition-colors"
              onClick={() => setSelectedStatus('all')}
            >
              All
            </Badge>
            {Object.values(PROJECT_STATUS).map((status) => (
              <Badge
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                className="cursor-pointer capitalize transition-colors"
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Badge>
            ))}
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 font-medium text-gray-500 text-sm dark:text-gray-400">Tags:</span>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-gray-500 text-sm transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid Container */}
        <div className={cn('grid gap-6', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}>
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.name} project={project} index={index} onClick={setSelectedProject} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            className="flex min-h-[300px] flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...microDampingPreset }}
          >
            {hasActiveFilters ? (
              <>
                <h3 className="mb-2 font-bold text-2xl text-gray-700 dark:text-gray-300">No matching projects</h3>
                <p className="mb-4 text-gray-500 text-lg dark:text-gray-400">Try adjusting your filters</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <h3 className="mb-2 font-bold text-3xl text-gray-700 dark:text-gray-300">No Projects Yet</h3>
                <p className="text-gray-500 text-lg dark:text-gray-400">Check back soon for new projects!</p>
              </>
            )}
          </motion.div>
        )}

        {/* Detail Dialog */}
        <ProjectDetailDialog project={selectedProject} open={!!selectedProject} onClose={() => setSelectedProject(null)} />
      </div>
    </ErrorBoundary>
  );
}
