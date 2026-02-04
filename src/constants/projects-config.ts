// Import YAML config directly - processed by @rollup/plugin-yaml

import type { Project, ProjectsIntro } from '@lib/config/types';
import yamlConfig from '../../config/site.yaml';

// Re-export types for convenience
export type { Project, ProjectStatus } from '@lib/config/types';
export { PROJECT_STATUS } from '@lib/config/types';

export const projectsData: Project[] = yamlConfig.projects?.data ?? [];

export const projectsIntro: ProjectsIntro = yamlConfig.projects?.intro ?? {
  title: 'Projects',
  subtitle: '',
};

/** Extract all unique tags from projects */
export const allTags: string[] = Array.from(new Set(projectsData.flatMap((p) => p.tags))).sort();
