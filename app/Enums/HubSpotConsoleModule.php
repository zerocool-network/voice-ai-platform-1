<?php

namespace App\Enums;

enum HubSpotConsoleModule: string
{
    case Overview = 'overview';
    case Search = 'search';
    case Properties = 'properties';
    case Schemas = 'schemas';
    case Pipelines = 'pipelines';
    case Lists = 'lists';
    case Imports = 'imports';
    case Exports = 'exports';
    case Owners = 'owners';
    case Associations = 'associations';
    case Forms = 'forms';
    case MarketingEmails = 'marketing-emails';
    case MarketingEvents = 'marketing-events';
    case Transactional = 'transactional';
    case Campaigns = 'campaigns';
    case CommsPrefs = 'comms-prefs';
    case Conversations = 'conversations';
    case Timeline = 'timeline';
    case CmsPages = 'cms-pages';
    case CmsBlogs = 'cms-blogs';
    case Hubdb = 'hubdb';
    case Domains = 'domains';
    case Redirects = 'redirects';
    case SiteSearch = 'site-search';
    case Files = 'files';
    case Automation = 'automation';
    case Sequences = 'sequences';
    case SettingsUsers = 'settings-users';
    case BusinessUnits = 'business-units';
    case Account = 'account';
    case Webhooks = 'webhooks';
    case Reporting = 'reporting';
    case Privacy = 'privacy';
    case VoiceSync = 'voice-sync';
    case Extensions = 'extensions';
    case Developer = 'developer';

    public function labelKey(): string
    {
        return 'hubspot.modules.'.$this->value;
    }

    public function group(): string
    {
        return match ($this) {
            self::Overview, self::Search, self::Reporting => 'overview',
            self::Properties, self::Schemas, self::Pipelines, self::Lists,
            self::Imports, self::Exports, self::Owners, self::Associations => 'crm_infra',
            self::Forms, self::MarketingEmails, self::MarketingEvents,
            self::Transactional, self::Campaigns, self::CommsPrefs => 'marketing',
            self::Conversations, self::Timeline => 'conversations',
            self::CmsPages, self::CmsBlogs, self::Hubdb, self::Domains,
            self::Redirects, self::SiteSearch => 'cms',
            self::Files => 'files',
            self::Automation, self::Sequences => 'automation',
            self::SettingsUsers, self::BusinessUnits, self::Account => 'settings',
            self::Webhooks, self::Extensions, self::Developer => 'developer',
            self::Privacy => 'privacy',
            self::VoiceSync => 'voice',
        };
    }

    /** @return list<self> */
    public static function navigable(): array
    {
        return self::cases();
    }
}
