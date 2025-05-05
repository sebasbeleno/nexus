# Nexus Super Admin

This is the super admin application for the Nexus project management system.

## Survey Builder

The Survey Builder provides an intuitive interface for creating and editing surveys with various question types. It features:

### Components

- **EditSurveyPage**: Main container for the survey builder interface with a grid layout.
- **SectionList**: Displays all sections of the current survey with the ability to add new sections.
- **SectionEditor**: Shows the content of the currently selected section.
- **QuestionTypeCard**: Contains the various question types that can be added to a section.
- **SectionSettingsDialog**: Provides settings options for each section.

### Features

- Responsive grid layout with sections list and question types on the left
- Real-time preview of the current section on the right
- Support for 8 question types:
  - Text
  - Number
  - Select (dropdown)
  - Multi-select
  - Radio buttons
  - Checkboxes
  - Date picker
  - Time picker
- Section management:
  - Add new sections
  - Edit section title and description
  - Delete sections
- Question management:
  - Add questions to sections
  - Preview questions with appropriate controls
  - Delete questions

### Usage

1. Navigate to a survey's edit page
2. Select a section from the left panel
3. Click on a question type to add it to the selected section
4. Use the settings icon to modify section properties
5. Click "Save Changes" to persist your modifications

## Development

### Pre-requisites

- Node.js
- PNPM package manager
- Supabase account and local setup

### Getting started

1. Install dependencies: `pnpm install`
2. Start the development server: `pnpm dev`
