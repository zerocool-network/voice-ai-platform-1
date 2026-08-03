<?php

namespace App\Enums;

enum HubSpotObjectType: string
{
    case Contacts = 'contacts';
    case Companies = 'companies';
    case Deals = 'deals';
    case Tickets = 'tickets';
    case Products = 'products';
    case LineItems = 'line_items';
    case Quotes = 'quotes';
    case FeedbackSubmissions = 'feedback_submissions';
    case Tasks = 'tasks';
    case Notes = 'notes';
    case Meetings = 'meetings';
    case Calls = 'calls';
    case Emails = 'emails';
    case Invoices = 'invoices';
    case MarketingEvents = 'marketing_events';
    case Subscriptions = 'subscriptions';
    case Goals = 'goal_targets';
    case Discounts = 'discounts';
    case Fees = 'fees';
    case Taxes = 'taxes';
    case Payments = 'commerce_payments';
    case Users = 'users';
    case PostalMail = 'postal_mail';
    case Orders = 'orders';
    case Leads = 'leads';
    case Services = 'services';
    case Courses = 'courses';
    case Listings = 'listings';
    case Projects = 'projects';
    case Communications = 'communications';
    case DealSplits = 'deal_splits';

    public function objectTypeId(): string
    {
        return match ($this) {
            self::Contacts => '0-1',
            self::Companies => '0-2',
            self::Deals => '0-3',
            self::Tickets => '0-5',
            self::Products => '0-7',
            self::LineItems => '0-8',
            self::Quotes => '0-14',
            self::FeedbackSubmissions => '0-19',
            self::Tasks => '0-27',
            self::Notes => '0-46',
            self::Meetings => '0-47',
            self::Calls => '0-48',
            self::Emails => '0-49',
            self::Invoices => '0-53',
            self::MarketingEvents => '0-54',
            self::Subscriptions => '0-69',
            self::Goals => '0-74',
            self::Discounts => '0-84',
            self::Fees => '0-85',
            self::Taxes => '0-86',
            self::Payments => '0-101',
            self::Users => '0-115',
            self::PostalMail => '0-116',
            self::Orders => '0-123',
            self::Leads => '0-136',
            self::Services => '0-162',
            self::Courses => '0-410',
            self::Listings => '0-420',
            self::Projects => '0-970',
            self::Communications => '0-18',
            self::DealSplits => '0-72',
        };
    }

    public function apiPath(): string
    {
        return $this->value;
    }

    public function labelKey(): string
    {
        return 'hubspot.objects.'.$this->value;
    }

    public function group(): string
    {
        return match ($this) {
            self::Contacts, self::Companies, self::Deals, self::Tickets, self::Leads, self::Users => 'crm',
            self::Products, self::LineItems, self::Quotes, self::Invoices, self::Subscriptions,
            self::Discounts, self::Fees, self::Taxes, self::Payments, self::Orders => 'commerce',
            self::Tasks, self::Notes, self::Meetings, self::Calls, self::Emails,
            self::PostalMail, self::Communications, self::FeedbackSubmissions => 'activities',
            self::MarketingEvents, self::Goals, self::Services, self::Courses, self::Listings,
            self::Projects, self::DealSplits => 'other',
        };
    }

    /** @return list<string> */
    public function defaultProperties(): array
    {
        return match ($this) {
            self::Contacts => ['firstname', 'lastname', 'email', 'phone', 'hs_object_id'],
            self::Companies => ['name', 'domain', 'phone', 'hs_object_id'],
            self::Deals => ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'hs_object_id'],
            self::Tickets => ['subject', 'content', 'hs_pipeline', 'hs_pipeline_stage', 'hs_ticket_priority', 'hs_object_id'],
            self::Products => ['name', 'description', 'price', 'hs_object_id'],
            self::LineItems => ['name', 'quantity', 'price', 'hs_object_id'],
            self::Quotes => ['hs_title', 'hs_status', 'hs_object_id'],
            self::Leads => ['hs_lead_name', 'hs_lead_status', 'hs_object_id'],
            self::Calls => ['hs_call_title', 'hs_call_body', 'hs_timestamp', 'hs_object_id'],
            self::Notes => ['hs_note_body', 'hs_timestamp', 'hs_object_id'],
            self::Tasks => ['hs_task_subject', 'hs_task_status', 'hs_timestamp', 'hs_object_id'],
            self::Meetings => ['hs_meeting_title', 'hs_meeting_body', 'hs_timestamp', 'hs_object_id'],
            self::Emails => ['hs_email_subject', 'hs_email_text', 'hs_timestamp', 'hs_object_id'],
            default => ['hs_object_id', 'hs_createdate', 'hs_lastmodifieddate'],
        };
    }

    /** @return list<string> */
    public function requiredScopes(): array
    {
        return match ($this) {
            self::Contacts => ['crm.objects.contacts.read'],
            self::Companies => ['crm.objects.companies.read'],
            self::Deals => ['crm.objects.deals.read'],
            self::Tickets => ['tickets'],
            self::Products => ['e-commerce'],
            self::Quotes => ['crm.objects.quotes.read'],
            self::Leads => ['crm.objects.leads.read'],
            self::Orders => ['crm.objects.orders.read'],
            self::Invoices => ['crm.objects.invoices.read'],
            default => ['crm.objects.contacts.read'],
        };
    }

    public static function tryFromSlug(string $slug): ?self
    {
        return self::tryFrom($slug);
    }
}
