const { google } = require('googleapis');
const keys = require('../../google/service-account-key.json');

const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
);

const sheets = google.sheets({ version: 'v4', auth: client });

async function getWeddingSayings() {
    try {
        const spreadsheetId = '1AXfSH0-ud95K50RD-ENXnu0bYgv676xFnuw0pK8r94g';
        const range = 'Sheet1!A1:B71';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values;
        if (rows.length) {
            const data = rows.slice(1).map(row => ({
                category: row[0],
                content: row[1],
            }));
            return data;
        } else {
            console.log('No data found.');
            return [];
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheet:', error);
        return [];
    }
}

module.exports = {
    getWeddingSayings
}; 