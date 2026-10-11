// sanity/schemaTypes/index.ts
// Registers every document type with the Studio. Add new schema files here
// as more content types (themes, team, ...) move into the CMS.

import { projectType } from './project';
import { newsPostType } from './newsPost';
import { hackathonType } from './hackathon';
import { eventType } from './event';
import { newsletterSubscriberType } from './newsletterSubscriber';
import { publicationType } from './publication';
import { teamMemberType } from './teamMember';
import { sitePopupType } from './sitePopup';
import { themeType } from './theme';
import { homeStatsType } from './homeStats';

export const schemaTypes = [
  sitePopupType,
  homeStatsType,
  projectType,
  newsPostType,
  hackathonType,
  eventType,
  newsletterSubscriberType,
  publicationType,
  teamMemberType,
  themeType,
];
