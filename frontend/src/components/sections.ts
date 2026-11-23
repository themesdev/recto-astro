// The blocks a page's Sections field holds, as pageQuery returns them: each section's content plus Sanity's _type and
// _key. The same union as the Next edition's generated PageBuilder.tsx, for the .astro sections (./PageBuilder.astro).
import type { HeroContent } from '../sections/items/sections/hero/types';
import type { PageHeaderContent } from '../sections/items/sections/page-header/types';
import type { SplitContent } from '../sections/items/sections/split/types';
import type { MediaContent } from '../sections/items/sections/media/types';
import type { ContentContent } from '../sections/items/sections/content/types';
import type { PostsContent } from '../sections/items/sections/posts/types';
import type { TeamContent } from '../sections/items/sections/team/types';
import type { NewsletterContent } from '../sections/items/sections/newsletter/types';
import type { CtaContent } from '../sections/items/sections/cta/types';

export type SectionBlock =
  | (HeroContent & { _type: 'heroSection'; _key: string })
  | (PageHeaderContent & { _type: 'pageHeaderSection'; _key: string })
  | (SplitContent & { _type: 'splitSection'; _key: string })
  | (MediaContent & { _type: 'mediaSection'; _key: string })
  | (ContentContent & { _type: 'contentSection'; _key: string })
  | (PostsContent & { _type: 'postsSection'; _key: string })
  | (TeamContent & { _type: 'teamSection'; _key: string })
  | (NewsletterContent & { _type: 'newsletterSection'; _key: string })
  | (CtaContent & { _type: 'ctaSection'; _key: string });
