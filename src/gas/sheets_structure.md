# Google Sheets Structure for Makkaizou-LINE Integration

This document outlines the structure of the Google Sheets document that will be used for the Makkaizou-LINE integration project.

## 1. Mapping Sheet

This sheet will store the mapping between LINE group/user IDs and Makkaizou talk_ids.

| Column Name | Description |
|-------------|-------------|
| groupId | The LINE group ID |
| userId | The LINE user ID |
| talk_id | The Makkaizou talk_id |
| created_at | Timestamp when the mapping was created |
| last_used | Timestamp when the mapping was last used |

## 2. Configuration Sheet

This sheet will store configuration parameters for the application.

| Key | Value | Description |
|-----|-------|-------------|
| line_channel_secret | [SECRET] | The LINE channel secret for webhook validation |
| line_access_token | [SECRET] | The LINE channel access token for sending messages |
| makkaizou_api_key | [SECRET] | The Makkaizou API key (external_integration_key) |
| makkaizou_api_url | https://api.example.com | The Makkaizou API URL |
| learning_model_code | [CODE] | The Makkaizou learning model code |
| enable_loading_indicator | true | Whether to show loading indicators |
| bot_name | [NAME] | The name of the LINE bot (for mention detection) |

## 3. Logs Sheet

This sheet will store logs of message interactions.

| Column Name | Description |
|-------------|-------------|
| timestamp | When the interaction occurred |
| groupId | The LINE group ID |
| userId | The LINE user ID |
| message | The message sent by the user |
| response | The response from Makkaizou |
| status | Success or error status |
| processing_time | Time taken to process the request (in seconds) |

## 4. Error Logs Sheet

This sheet will store detailed error logs.

| Column Name | Description |
|-------------|-------------|
| timestamp | When the error occurred |
| error_type | Type of error (e.g., API_ERROR, VALIDATION_ERROR) |
| error_message | Detailed error message |
| context_data | JSON string with context data about the error |
| stack_trace | Stack trace if available |