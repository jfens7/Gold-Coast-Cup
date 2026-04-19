from flask import send_file
import io

# Add this below your registration routes in api.py
@app.route('/api/admin/export-zermelo', methods=['GET'])
def export_zermelo():
    """Generates a Zermelo-compatible CSV of all registered players."""
    # Note: When Firebase is live, you fetch db.collection('entries') here.
    # For now, we simulate fetching paid users.
    paid_players = [
        {"id": "12345", "first": "Jakob", "last": "Fensom", "rating": "1850", "club": "GCTTA"},
        {"id": "67890", "first": "Naoya", "last": "Yamamoto", "rating": "2100", "club": "GCTTA"}
    ]
    
    # Zermelo usually expects: Last Name, First Name, ID, Rating, Club
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['LastName', 'FirstName', 'MemberID', 'Rating', 'Club'])
    
    for p in paid_players:
        writer.writerow([p['last'], p['first'], p['id'], p['rating'], p['club']])
    
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name='zermelo_import.csv'
    )