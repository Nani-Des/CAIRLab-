// sanity.config.ts
// Sanity Studio configuration, embedded into this Next.js app at /studio
// (see app/studio/[[...tool]]/page.tsx). Requires NEXT_PUBLIC_SANITY_PROJECT_ID
// and NEXT_PUBLIC_SANITY_DATASET to be set (see .env.local.example) — until
// then the Studio will prompt to configure a project rather than connect.

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool, type StructureBuilder } from 'sanity/structure';
import { apiVersion, dataset, projectId } from './sanity/env';
import { schemaTypes } from './sanity/schemaTypes';
import RegistrationSummary from './sanity/components/RegistrationSummary';
import { SendBroadcastAction } from './sanity/actions/SendBroadcastAction';
import AddPartner from './sanity/components/AddPartner';

// Registrations filtered by status, newest first.
const registrationList = (S: StructureBuilder, title: string, filter: string) =>
  S.documentList()
    .title(title)
    .schemaType('aiProRegistration')
    .filter(`_type == "aiProRegistration"${filter}`)
    .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }]);

export default defineConfig({
  name: 'default',
  title: 'CAIRLab CMS',

  projectId,
  dataset,

  plugins: [
    structureTool({
      // Pins the singletons (Site Popup, Homepage Stats) at the top, each
      // linked straight to its one document (skipping the usual list view)
      // so they're quick to find, then an "AI for Professionals" folder
      // (open/close switch + registrations by status) — everything else
      // lists normally below.
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
            S.listItem()
              .title('AI for Professionals')
              .child(
                S.list()
                  .title('AI for Professionals')
                  .items([
                    S.listItem()
                      .title('Summary (number of registrations)')
                      .child(S.component(RegistrationSummary).title('Summary')),
                    S.listItem()
                      .title('Broadcast messages')
                      .child(
                        S.documentTypeList('aiProBroadcast')
                          .title('Broadcast messages')
                          .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                      ),
                    S.listItem()
                      .title('Registration open / closed')
                      .child(S.document().schemaType('aiProSettings').documentId('aiProSettings')),
                    S.divider(),
                    S.listItem()
                      .title('Partner organisations & nominees')
                      .child(
                        S.documentTypeList('aiProPartner')
                          .title('Partner organisations')
                          .defaultOrdering([{ field: 'name', direction: 'asc' }])
                          // No "+" here: new partners need a private ID, see AddPartner.
                          .initialValueTemplates([])
                      ),
                    S.listItem()
                      .title('Add a partner organisation')
                      .child(S.component(AddPartner).title('Add a partner organisation')),
                    S.divider(),
                    S.listItem()
                      .title('Registered staff (nominated)')
                      .child(registrationList(S, 'Registered staff', ' && role == "employee"')),
                    S.listItem()
                      .title('Graduate applications')
                      .child(registrationList(S, 'Graduate applications', ' && role == "graduate"')),
                    S.listItem().title('All registrations').child(registrationList(S, 'All registrations', '')),
                  ])
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) =>
                !['sitePopup', 'homeStats', 'aiProRegistration', 'aiProSettings', 'aiProBroadcast', 'aiProPartner'].includes(item.getId() ?? '')
            ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,
  },

  // Broadcast messages get a "Send to recipients" button next to Publish.
  document: {
    actions: (prev, context) => (context.schemaType === 'aiProBroadcast' ? [...prev, SendBroadcastAction] : prev),
    // Registrations are created by the website and partners by "Add a partner
    // organisation" (private IDs), so keep them out of the global "+" menu.
    newDocumentOptions: (prev) => prev.filter((t) => !['aiProRegistration', 'aiProPartner'].includes(t.templateId)),
  },
});
