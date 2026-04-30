---
name: Video Library Uploads - FAQ Series
description: User uploaded 5 short Arabic FAQ videos about feasibility studies to the YieldX video library
type: reference
---

## Video Upload Session - April 2026

The user uploaded **5 short educational videos** in Arabic to the YieldX Video Library. These are quick FAQ-style videos about feasibility studies.

**Why:** To expand the free video content and answer common questions for Arabic-speaking users.

**How to apply:** These videos are now part of the YieldX video library and can be found in the "Getting Started" category, Level 0, all marked as free-tier content.

### Videos Uploaded:

1. **أكثر سؤال يتكرر؟** (Most Frequently Asked Question) - 19 seconds
   - File: `src/imports/IMG_2103.mp4`
   - English: "Most Frequently Asked Question About Feasibility Studies"

2. **الفرق بين التخطيط العادي ودراسة الجدوى** - 20 seconds
   - File: `src/imports/IMG_2100.mp4`
   - English: "The Difference Between Regular Planning and Feasibility Study"

3. **هل كل مشروع يحتاج دراسة جدوى؟** - 14 seconds
   - File: `src/imports/IMG_2096.mp4`
   - English: "Does Every Project Need a Feasibility Study?"

4. **كم تستغرق دراسة الجدوى؟** - 14 seconds
   - File: `src/imports/IMG_2069.mp4`
   - English: "How Long Does a Feasibility Study Take?"

5. **ليش لازم نبدأ بدراسة الجدوى؟** - 14 seconds
   - File: `src/imports/IMG_2066.mp4`
   - English: "Why Should We Start With a Feasibility Study?"

### Implementation Details:

- **Location:** Videos added to `/src/app/data/subscriptionData.ts`
- **Category:** Getting Started
- **Level:** 0 (Beginner)
- **Access:** Free tier (accessible to all users)
- **Status:** All marked as "NEW" with `isNew: true`
- **Instructor:** YieldX Team / فريق YieldX
- **Player:** Enhanced to support both YouTube embeds and local MP4 files

### Files Modified:
1. `/src/app/data/subscriptionData.ts` - Added 5 video entries
2. `/src/app/components/video-library/VideoLibrary.tsx` - Updated player to handle local videos
3. `/workspaces/default/code/NEW_VIDEOS_ADDED.md` - Documentation of changes

### Video Library Count:
- **Before:** 25 videos
- **After:** 30 videos
- **Free videos:** 10 total

All videos include bilingual titles and descriptions (Arabic/English) for full platform integration.
