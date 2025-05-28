// Serve static files
app.use(express.static(path.join(__dirname, 'client')));

// Footer page routes
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'about.html'));
});

app.get('/careers', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'careers.html'));
});

app.get('/press', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'press.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'blog.html'));
});

app.get('/investors', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'investors.html'));
});

app.get('/help', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'help.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'faq.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'contact.html'));
});

app.get('/safety', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'safety.html'));
});

app.get('/cancellation', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'cancellation.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'payment.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'terms.html'));
});

app.get('/cookies', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'cookies.html'));
});

app.get('/accessibility', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'accessibility.html'));
}); 