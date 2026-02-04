/**
 * Configuration Module
 *
 * Provides type definitions for site configuration from YAML
 * YAML is now directly imported using @rollup/plugin-yaml
 */

export type {
  AnnouncementConfig,
  AnnouncementLink,
  ChristmasConfig,
  ChristmasFeatures,
  ContentConfig,
  FeaturedCategory,
  FeaturedSeries,
  FeaturedSeriesLinks,
  Project,
  ProjectLinks,
  ProjectStatus,
  ProjectsConfig,
  ProjectsIntro,
  RouterItem,
  SiteBasicConfig,
  SiteYamlConfig,
  SnowfallConfig,
  SocialConfig,
  SocialPlatform,
} from './types';

export { PROJECT_STATUS } from './types';
