---
name: LetsGoo
description: Sunlit Casablanca discovery, with practical details close at hand.
colors:
  primary: "#174e43"
  primary-hover: "#246b59"
  foreground: "#163a35"
  background: "#fbfaf6"
  primary-foreground: "#ffffff"
  coral: "#bc4b2d"
  sage: "#e8ecdf"
  sand: "#f1ebdf"
  muted: "#ebece4"
  muted-foreground: "#596760"
  border: "#d8ded3"
  ring: "#cd542e"
typography:
  display:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(52px, 5.4vw, 78px)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "30px"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "19px"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.018em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  chip: "6px"
  button: "7px"
  search: "10px"
  surface: "12px"
  hero: "13px"
spacing:
  compact: "8px"
  control: "12px"
  group: "20px"
  section: "25px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "12px 19px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.button}"
    padding: "12px 19px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.button}"
    padding: "12px 19px"
  category:
    backgroundColor: "transparent"
    rounded: "{rounded.chip}"
    padding: "10px 14px"
  category-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  input:
    backgroundColor: "{colors.primary-foreground}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.chip}"
    padding: "12px"
  card-photo:
    rounded: "{rounded.surface}"
    height: "235px"
---

# Design System: LetsGoo

## Overview

**Creative North Star: "Sunlit Casablanca"**

Warm ivory, deep teal, coral accents and Moroccan photography create an inviting daylight setting for choosing an outing. The system pairs expressive headlines with familiar controls and compact practical details.

The interface is flat and restrained. Tonal surfaces, fine dividers and gently curved photographs establish groups without heavy decoration. Photography carries atmosphere while prices, setting and sample status remain legible.

**Key Characteristics:**

- Sunlit ivory surfaces with teal structure and coral emphasis.
- Self-hosted DM Sans across expressive headings and practical labels.
- Photographic cards with visible cost and setting.
- Flat surfaces, fine borders and restrained motion.

## Colors

The palette combines warm paper neutrals with grounded greens and a fired-clay accent. Normative values are in the frontmatter, extracted from the implementation.

### Primary

- **Action Teal** (`primary`): primary actions and selected categories; white text provides clear contrast.
- **Lifted Teal** (`primary-hover`): the primary action hover state.

### Secondary

- **Terracotta Coral** (`coral`): brand punctuation, selected navigation, saved favorites and headline emphasis.
- **Focus Clay** (`ring`): keyboard focus outlines, distinct from persistent selection.

### Neutral

- **Sunlit Ivory** (`background`): the page canvas.
- **Deep Teal Ink** (`foreground`): headings and principal content.
- **Soft Sage** (`sage`): the outing invitation surface.
- **Warm Sand** (`sand`): quieter controls and placeholder surfaces.
- **Mist** (`muted`), **Quiet Green Ink** (`muted-foreground`), and **Pale Green Edge** (`border`): supporting surfaces, secondary text and dividers.
- **White** (`primary-foreground`): input surfaces and text on teal actions.

**The Clear State Rule.** Use teal for selected controls, coral for navigation emphasis and saved favorites, and a visible clay outline for keyboard focus.

## Typography

**Display Font:** DM Sans (sans-serif fallback).

**Body Font:** DM Sans (sans-serif fallback).

The self-hosted variable font supplies a consistent, open voice. Tight display tracking and moderate weights give headlines presence; supporting text stays compact and conversational.

### Hierarchy

- **Display:** the frontmatter display role describes the desktop hero; mobile uses a fluid clamp (43px to 58px at 12.8vw).
- **Headline:** section titles use the headline role; the discovery title becomes smaller on mobile (26px).
- **Title:** card names use the title role with a more generous line height (1.3); mobile cards increase to 21px.
- **Body:** the body role supports reading; longer page introductions and detail prose cap at approximately 65–70ch.
- **Label:** the label role describes shared buttons. Navigation is slightly lighter (550); metadata ranges from 10–13px depending on context.

## Layout

Main discovery sections center within a maximum width (1440px), with desktop side padding (6%). The hero uses two unequal columns (1fr / 1.1fr). Listing cards use three equal columns with generous row and column gaps (32px / 25px).

At 1200px, the composition tightens. At 900px, gutters become 5%, the search field wraps above its selects, and card imagery becomes shorter. At 640px, the hero and card grid become single-column, navigation becomes a menu, and categories remain horizontally scrollable. Mobile card images are tall enough to retain their photographic character (245px).

Details pair reading content with a visit summary; on mobile the summary moves before the details and loses sticky positioning. Small gaps organize controls; wider section spacing separates decisions.

## Elevation & Depth

There are no box shadows in the implemented system. Depth comes from contrasting ivory, white, sage and sand surfaces, fine borders, and dark translucent captions over photographs. Avoid introducing elevation that competes with imagery.

**The Flat Surface Rule.** Preserve tonal separation and fine borders as the default means of grouping content.

## Shapes

Controls have modest curves, with shared buttons slightly rounder than category chips and inputs. Search panels and photographic surfaces use broader corners; the hero photograph is subtly rounder again. Circular save buttons are the compact exception. Photographs clip inside their curved bounds.

## Components

### Buttons

Confident and compact. Primary buttons use Action Teal with white text; outlined and ghost variants stay quiet until hover. Shared buttons have a minimum height (45px). The hero action has a short background transition (200ms). Keyboard focus uses a clay outline (3px with 4px offset); disabled buttons dim (opacity 0.55) and show a waiting cursor.

### Chips

Category controls use a fine border and transparent background at rest, a pale green hover, and teal with white text when selected. Keep the horizontal mobile category row scrollable rather than compressing labels.

### Cards / Containers

Place cards sit directly on the page canvas. The image is clipped, while category, save control and sample-photo disclosure overlay it. Practical metadata, title, activities and a divided price row sit below. Pointer hover gently enlarges the image (scale 1.035 over 350ms, cubic-bezier(0.16, 1, 0.3, 1)); touch devices do not receive this effect.

### Inputs / Fields

Form fields use white surfaces, a muted green stroke and gently rounded corners. The discovery search groups its text field and selects into one bordered white panel. Focus follows the shared visible outline; placeholder text remains muted and the caret uses coral.

### Navigation

The compact brand combines teal lettering and coral accents. Navigation uses 13px medium-weight text with coral hover and active states. Links have a minimum height (44px). On mobile, an accessible menu reveals an ivory, bordered navigation panel below the header.

### Photographic invitation

The hero pairs a curved photograph with a dark translucent lower caption and a small warm-paper stamp. Preserve image legibility and explicit sample-image disclosure. Reduced-motion preference removes transitions and animations and restores instant scrolling.

## Do's and Don'ts

### Do:

- Do keep cost, setting and sample status visible alongside place imagery.
- Do use ivory, white and sage surfaces to organize information without shadows.
- Do preserve visible keyboard focus and reduced-motion behavior.
- Do use the implemented DM Sans hierarchy and responsive single-column mobile layout.

### Don't:

- Don't present sample photos or listings as verified venue evidence.
- Don't invent ratings, visitor counts or offers to fill visual space.
- Don't apply pointer-only image enlargement to touch interactions.
