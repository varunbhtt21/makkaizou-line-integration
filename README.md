# Makkaizou-LINE Integration

This project integrates the LINE Messaging API with the Makkaizou AI platform using Google Apps Script (GAS) as the middleware and Google Sheets for data storage.

## Overview

The system enables LINE users to interact with the Makkaizou AI by mentioning the LINE Official Account in group conversations, receiving AI-generated responses that leverage Makkaizou's learning models.

### Key Features

- Processes messages only when the LINE Official Account is explicitly mentioned
- Maintains conversation context through Makkaizou's talk_id system
- Stores user/group mapping data in Google Sheets
- Provides AI-powered responses with reference information
- Displays loading indicators during processing
- Supports future expansion to multiple LINE accounts

## Project Structure

```
src/
├── gas/
│   ├── Code.js              # Main GAS script with webhook handling
│   ├── LineApi.js           # Functions for interacting with LINE API
│   ├── TalkIdManager.js     # Functions for managing talk_ids
│   └── sheets_structure.md  # Documentation of Google Sheets structure
└── ...
```

## Implementation Phases

### Phase 1: Foundation (Current)

- Set up Google Sheets structure
- Create GAS project and web app endpoint
- Implement webhook validation
- Set up basic logging

### Phase 2: Core Functionality (Next)

- Implement mention detection
- Add talk_id management
- Connect to Makkaizou API
- Implement basic response formatting

### Phase 3: Enhancement

- Add loading indicator support
- Implement reference formatting
- Improve error handling
- Add comprehensive logging

### Phase 4: Testing and Deployment

- Testing with various message scenarios
- Refine error handling based on test results
- Deploy as web app
- Create documentation

## Setup Instructions

### Google Sheets Setup

1. Create a new Google Sheets document
2. Set up the following sheets:
   - Mapping: For storing user/group to talk_id mappings
   - Configuration: For storing API keys and settings
   - Logs: For recording message interactions
   - ErrorLogs: For detailed error logging

### Google Apps Script Setup

1. Open the Google Sheets document
2. Go to Extensions > Apps Script
3. Create the script files as per the project structure
4. Deploy as a web app:
   - Go to Deploy > New deployment
   - Select Web app as the deployment type
   - Set access to "Anyone"
   - Deploy and note the web app URL

### LINE Developer Console Setup

1. Create a LINE Developer account if you don't have one
2. Create a new provider and channel
3. Configure the webhook URL to point to your GAS web app URL
4. Enable webhook usage
5. Get the channel secret and access token
6. Add these to the Configuration sheet in Google Sheets

## Configuration

The following configuration values should be set in the Configuration sheet:

| Key | Description |
|-----|-------------|
| line_channel_secret | The LINE channel secret for webhook validation |
| line_access_token | The LINE channel access token for sending messages |
| makkaizou_api_key | The Makkaizou API key (external_integration_key) |
| makkaizou_api_url | The Makkaizou API URL |
| learning_model_code | The Makkaizou learning model code |
| enable_loading_indicator | Whether to show loading indicators (true/false) |
| bot_name | The name of the LINE bot (for mention detection) |
| debug_mode | Enable debug logging (true/false) |

## Testing

To test the setup:

1. Run the `testSetup()` function from the Apps Script editor
2. Check that the sheets are created with the correct headers
3. Verify that the test log entry is added to the Logs sheet

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.