// sanity.config.ts
// Sanity Studio configuration, embedded into this Next.js app at /studio
// (see app/studio/[[...tool]]/page.tsx). Requires NEXT_PUBLIC_SANITY_PROJECT_ID
// and NEXT_PUBLIC_SANITY_DATASET to be set (see .env.local.example) — until
// then the Studio will prompt to configure a project rather than connect.

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { apiVersion, dataset, projectId } from './sanity/env';
import { schemaTypes } from './sanity/schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'CAIRLab CMS',

  projectId,
  dataset,

  plugins: [
    structureTool({
      // Pins the singletons (Site Popup, Homepage Stats) at the top, each
      // linked straight to its one document (skipping the usual list view)
      // so they're quick to find — everything else lists normally below.
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Popup')
              .child(S.document().schemaType('sitePopup').documentId('sitePopup')),
            S.listItem()
              .title('Homepage Stats')
              .child(S.document().schemaType('homeStats').documentId('homeStats')),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => !['sitePopup', 'homeStats'].includes(item.getId() ?? '')),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,
  },
});
