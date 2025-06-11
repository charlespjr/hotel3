const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import API routes
const apiRoutes = require('./server/routes/api');

// Mount API routes
app.use('/api', apiRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'client')));

// Routes for HTML pages
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'about.html'));
});

app.get('/careers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'careers.html'));
});

app.get('/press', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'press.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'contact.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'terms.html'));
});

app.get('/sitemap', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'sitemap.html'));
});

app.get('/robots', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'robots.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'faq.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'blog.html'));
});

app.get('/support', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'support.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'register.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'reset-password.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'profile.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'settings.html'));
});

app.get('/notifications', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'notifications.html'));
});

app.get('/messages', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'messages.html'));
});

app.get('/bookings', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'bookings.html'));
});

app.get('/wishlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'wishlist.html'));
});

app.get('/reviews', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'reviews.html'));
});

app.get('/payments', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'payments.html'));
});

app.get('/security', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'security.html'));
});

app.get('/preferences', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'preferences.html'));
});

app.get('/language', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'language.html'));
});

app.get('/currency', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'currency.html'));
});

app.get('/timezone', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'timezone.html'));
});

app.get('/notifications-settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'notifications-settings.html'));
});

app.get('/privacy-settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'privacy-settings.html'));
});

app.get('/connected-accounts', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'connected-accounts.html'));
});

app.get('/api-keys', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'api-keys.html'));
});

app.get('/webhooks', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'webhooks.html'));
});

app.get('/logs', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'logs.html'));
});

app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'analytics.html'));
});

app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'reports.html'));
});

app.get('/export', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'export.html'));
});

app.get('/import', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'import.html'));
});

app.get('/backup', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'backup.html'));
});

app.get('/restore', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'restore.html'));
});

app.get('/system', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'system.html'));
});

app.get('/updates', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'updates.html'));
});

app.get('/maintenance', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'maintenance.html'));
});

app.get('/status', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'status.html'));
});

app.get('/health', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'health.html'));
});

app.get('/metrics', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'metrics.html'));
});

app.get('/performance', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'performance.html'));
});

app.get('/errors', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'errors.html'));
});

app.get('/debug', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'debug.html'));
});

app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'test.html'));
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'docs.html'));
});

app.get('/api-docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'api-docs.html'));
});

app.get('/swagger', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'swagger.html'));
});

app.get('/redoc', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'redoc.html'));
});

app.get('/postman', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'postman.html'));
});

app.get('/sdk', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'sdk.html'));
});

app.get('/libraries', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'libraries.html'));
});

app.get('/examples', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'examples.html'));
});

app.get('/tutorials', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'tutorials.html'));
});

app.get('/guides', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'guides.html'));
});

app.get('/videos', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'videos.html'));
});

app.get('/webinars', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'webinars.html'));
});

app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'events.html'));
});

app.get('/community', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'community.html'));
});

app.get('/forum', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'forum.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'chat.html'));
});

app.get('/slack', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'slack.html'));
});

app.get('/discord', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'discord.html'));
});

app.get('/github', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'github.html'));
});

app.get('/twitter', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'twitter.html'));
});

app.get('/facebook', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'facebook.html'));
});

app.get('/linkedin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'linkedin.html'));
});

app.get('/youtube', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'youtube.html'));
});

app.get('/instagram', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'instagram.html'));
});

app.get('/pinterest', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'pinterest.html'));
});

app.get('/tiktok', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'tiktok.html'));
});

app.get('/reddit', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'reddit.html'));
});

app.get('/medium', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'medium.html'));
});

app.get('/dev', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dev.html'));
});

app.get('/hashnode', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'hashnode.html'));
});

app.get('/producthunt', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'producthunt.html'));
});

app.get('/hackernews', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'hackernews.html'));
});

app.get('/indiehackers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'indiehackers.html'));
});

app.get('/startup', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'startup.html'));
});

app.get('/founders', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'founders.html'));
});

app.get('/investors', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'investors.html'));
});

app.get('/partners', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'partners.html'));
});

app.get('/affiliates', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'affiliates.html'));
});

app.get('/resellers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'resellers.html'));
});

app.get('/wholesalers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'wholesalers.html'));
});

app.get('/distributors', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'distributors.html'));
});

app.get('/vendors', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'vendors.html'));
});

app.get('/suppliers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'suppliers.html'));
});

app.get('/manufacturers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'manufacturers.html'));
});

app.get('/whitelabel', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'whitelabel.html'));
});

app.get('/enterprise', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'enterprise.html'));
});

app.get('/government', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'government.html'));
});

app.get('/education', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'education.html'));
});

app.get('/nonprofit', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'nonprofit.html'));
});

app.get('/startups', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'startups.html'));
});

app.get('/agencies', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'agencies.html'));
});

app.get('/consultants', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'consultants.html'));
});

app.get('/freelancers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'freelancers.html'));
});

app.get('/developers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'developers.html'));
});

app.get('/designers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'designers.html'));
});

app.get('/marketers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'marketers.html'));
});

app.get('/sales', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'sales.html'));
});

app.get('/support-team', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'support-team.html'));
});

app.get('/success-team', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'success-team.html'));
});

app.get('/accounting', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'accounting.html'));
});

app.get('/legal', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'legal.html'));
});

app.get('/hr', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'hr.html'));
});

app.get('/operations', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'operations.html'));
});

app.get('/finance', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'finance.html'));
});

app.get('/it', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'it.html'));
});

app.get('/security-team', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'security-team.html'));
});

app.get('/compliance', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'compliance.html'));
});

app.get('/risk', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'risk.html'));
});

app.get('/audit', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'audit.html'));
});

app.get('/quality', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'quality.html'));
});

app.get('/research', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'research.html'));
});

app.get('/development', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'development.html'));
});

app.get('/testing', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'testing.html'));
});

app.get('/deployment', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'deployment.html'));
});

app.get('/monitoring', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'monitoring.html'));
});

app.get('/maintenance-team', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'maintenance-team.html'));
});

app.get('/infrastructure', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'infrastructure.html'));
});

app.get('/networking', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'networking.html'));
});

app.get('/storage', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'storage.html'));
});

app.get('/database', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'database.html'));
});

app.get('/cache', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'cache.html'));
});

app.get('/queue', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'queue.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'search.html'));
});

app.get('/analytics-engine', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'analytics-engine.html'));
});

app.get('/reporting', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'reporting.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dashboard.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'admin.html'));
});

app.get('/superadmin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'superadmin.html'));
});

app.get('/root', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'root.html'));
});

app.get('/system-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'system-admin.html'));
});

app.get('/network-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'network-admin.html'));
});

app.get('/security-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'security-admin.html'));
});

app.get('/database-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'database-admin.html'));
});

app.get('/storage-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'storage-admin.html'));
});

app.get('/backup-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'backup-admin.html'));
});

app.get('/restore-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'restore-admin.html'));
});

app.get('/monitoring-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'monitoring-admin.html'));
});

app.get('/logging-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'logging-admin.html'));
});

app.get('/audit-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'audit-admin.html'));
});

app.get('/compliance-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'compliance-admin.html'));
});

app.get('/risk-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'risk-admin.html'));
});

app.get('/quality-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'quality-admin.html'));
});

app.get('/testing-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'testing-admin.html'));
});

app.get('/deployment-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'deployment-admin.html'));
});

app.get('/development-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'development-admin.html'));
});

app.get('/research-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'research-admin.html'));
});

app.get('/operations-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'operations-admin.html'));
});

app.get('/finance-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'finance-admin.html'));
});

app.get('/hr-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'hr-admin.html'));
});

app.get('/legal-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'legal-admin.html'));
});

app.get('/accounting-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'accounting-admin.html'));
});

app.get('/sales-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'sales-admin.html'));
});

app.get('/marketing-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'marketing-admin.html'));
});

app.get('/support-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'support-admin.html'));
});

app.get('/success-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'success-admin.html'));
});

app.get('/partner-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'partner-admin.html'));
});

app.get('/affiliate-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'affiliate-admin.html'));
});

app.get('/reseller-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'reseller-admin.html'));
});

app.get('/wholesaler-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'wholesaler-admin.html'));
});

app.get('/distributor-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'distributor-admin.html'));
});

app.get('/vendor-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'vendor-admin.html'));
});

app.get('/supplier-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'supplier-admin.html'));
});

app.get('/manufacturer-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'manufacturer-admin.html'));
});

app.get('/whitelabel-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'whitelabel-admin.html'));
});

app.get('/enterprise-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'enterprise-admin.html'));
});

app.get('/government-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'government-admin.html'));
});

app.get('/education-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'education-admin.html'));
});

app.get('/nonprofit-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'nonprofit-admin.html'));
});

app.get('/startup-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'startup-admin.html'));
});

app.get('/agency-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'agency-admin.html'));
});

app.get('/consultant-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'consultant-admin.html'));
});

app.get('/freelancer-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'freelancer-admin.html'));
});

app.get('/developer-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'developer-admin.html'));
});

app.get('/designer-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'designer-admin.html'));
});

app.get('/marketer-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'marketer-admin.html'));
});

app.get('/sales-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'sales-team-admin.html'));
});

app.get('/support-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'support-team-admin.html'));
});

app.get('/success-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'success-team-admin.html'));
});

app.get('/accounting-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'accounting-team-admin.html'));
});

app.get('/legal-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'legal-team-admin.html'));
});

app.get('/hr-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'hr-team-admin.html'));
});

app.get('/operations-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'operations-team-admin.html'));
});

app.get('/finance-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'finance-team-admin.html'));
});

app.get('/it-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'it-team-admin.html'));
});

app.get('/security-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'security-team-admin.html'));
});

app.get('/compliance-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'compliance-team-admin.html'));
});

app.get('/risk-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'risk-team-admin.html'));
});

app.get('/audit-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'audit-team-admin.html'));
});

app.get('/quality-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'quality-team-admin.html'));
});

app.get('/research-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'research-team-admin.html'));
});

app.get('/development-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'development-team-admin.html'));
});

app.get('/testing-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'testing-team-admin.html'));
});

app.get('/deployment-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'deployment-team-admin.html'));
});

app.get('/monitoring-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'monitoring-team-admin.html'));
});

app.get('/maintenance-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'maintenance-team-admin.html'));
});

app.get('/infrastructure-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'infrastructure-team-admin.html'));
});

app.get('/networking-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'networking-team-admin.html'));
});

app.get('/storage-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'storage-team-admin.html'));
});

app.get('/database-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'database-team-admin.html'));
});

app.get('/cache-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'cache-team-admin.html'));
});

app.get('/queue-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'queue-team-admin.html'));
});

app.get('/search-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'search-team-admin.html'));
});

app.get('/analytics-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'analytics-team-admin.html'));
});

app.get('/reporting-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'reporting-team-admin.html'));
});

app.get('/dashboard-team-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dashboard-team-admin.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 