<?php

return [
    'cloud_base_url_suffix' => '.app.n8n.cloud/api/v1',
    'default_timeout' => 30,
    'templates' => [
        'post_call_hubspot' => [
            'name' => 'Post-call → HubSpot',
            'description' => 'Receives call.completed webhook and upserts a HubSpot contact + note.',
        ],
        'post_call_slack' => [
            'name' => 'Post-call → Slack',
            'description' => 'Posts a Slack message when a call completes.',
        ],
    ],
];
