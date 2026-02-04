import { microDampingPreset } from '@constants/anim/spring';
import type { Project, ProjectStatus } from '@constants/projects-config';
import { cn } from '@lib/utils';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react';
import { type MouseEvent, memo, useCallback, useRef } from 'react';
import { Badge } from '../ui/badge';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick?: (project: Project) => void;
}

/** CSS custom properties type extension */
interface CSSCustomProperties extends React.CSSProperties {
  '--card-color'?: string;
}

const DEFAULT_COLOR = '#3B82F6';

/** Default project image SVG */
const DEFAULT_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="100%" height="100%" viewBox="0 0 200 120" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="120" fill="#f3f4f6"/>
  <rect x="60" y="35" width="80" height="50" rx="8" fill="#e5e7eb"/>
  <rect x="70" y="45" width="25" height="4" rx="2" fill="#9ca3af"/>
  <rect x="70" y="53" width="45" height="4" rx="2" fill="#9ca3af"/>
  <rect x="70" y="61" width="35" height="4" rx="2" fill="#9ca3af"/>
  <circle cx="145" cy="55" r="15" fill="#d1d5db"/>
  <path d="M140 55 L145 50 L150 55 L147 55 L147 62 L143 62 L143 55 Z" fill="#9ca3af"/>
</svg>
`)}`;

/** Status badge styles */
const STATUS_STYLES: Record<ProjectStatus, string> = {
  active: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
  wip: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  archived: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

/** Status labels */
const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  wip: 'WIP',
  archived: 'Archived',
};

const ProjectCard = memo(
  function ProjectCard({ project, index, onClick }: ProjectCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Motion values for magnetic hover
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring animation for smooth magnetic effect
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), microDampingPreset);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), microDampingPreset);

    // Spotlight effect
    const sheenX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
    const sheenY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);

    const spotlight = useMotionTemplate`radial-gradient(
    600px circle at ${sheenX} ${sheenY},
    rgba(255,255,255,0.15),
    transparent 40%
  )`;

    // Use useCallback for event handlers
    const handleMouseMove = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const offsetX = (e.clientX - centerX) / rect.width;
        const offsetY = (e.clientY - centerY) / rect.height;

        x.set(offsetX);
        y.set(offsetY);
      },
      [x, y],
    );

    const handleMouseLeave = useCallback(() => {
      x.set(0);
      y.set(0);
    }, [x, y]);

    // Reset animation on click (prevent tilted card when dialog opens)
    const handleClick = useCallback(() => {
      x.jump(0);
      y.jump(0);
      onClick?.(project);
    }, [onClick, project, x, y]);

    const cardColor = project.color || DEFAULT_COLOR;
    const projectImage = project.image || DEFAULT_IMAGE;

    // Stagger delay with upper limit (prevent animation being too long for 50+ cards)
    const staggerDelay = Math.min(index * 0.03, 0.5);

    return (
      <motion.div
        ref={cardRef}
        className="project-card group relative block h-[280px] w-full cursor-pointer select-none"
        style={{ perspective: '1000px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: staggerDelay,
          ...microDampingPreset,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <motion.div
          className="relative h-full w-full rounded-2xl bg-white p-3 shadow-xl ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            rotateX,
            rotateY,
          }}
        >
          {/* Inner Card Container */}
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900">
            {/* Top Color Bar */}
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: cardColor }} />

            {/* Status Badge */}
            <Badge className={cn('absolute top-3 right-3 z-10 text-[10px]', STATUS_STYLES[project.status])}>
              {STATUS_LABELS[project.status]}
            </Badge>

            {/* Project Image */}
            <div className="relative h-28 w-full overflow-hidden">
              <img
                src={projectImage}
                alt={project.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_IMAGE;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900" />
            </div>

            {/* Content */}
            <div className="flex h-[calc(100%-7rem)] flex-col px-4 py-3">
              <h3
                className="truncate font-bold text-base text-gray-900 transition-colors group-hover:text-(--card-color) dark:text-white"
                style={{ '--card-color': cardColor } as CSSCustomProperties}
              >
                {project.name}
              </h3>
              <p className="mt-1 line-clamp-2 flex-1 text-gray-600 text-sm dark:text-gray-300">{project.description}</p>

              {/* Tags */}
              <div className="scrollbar-none mt-2 flex items-center gap-1.5 overflow-x-auto">
                {project.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline" className="shrink-0 text-[10px]">
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 4 && <span className="shrink-0 text-gray-400 text-xs">+{project.tags.length - 4}</span>}
              </div>
            </div>
          </div>

          {/* Spotlight Overlay */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: spotlight,
            }}
          />

          {/* Border Glow */}
          <div
            className="absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
            style={{ background: cardColor }}
          />
        </motion.div>
      </motion.div>
    );
  },
  (prev, next) => prev.project.name === next.project.name && prev.index === next.index && prev.onClick === next.onClick,
);

export default ProjectCard;
export { STATUS_STYLES, STATUS_LABELS };
