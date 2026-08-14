British Police Cricket Club Statistics Centre
This is a static cricket statistics website inspired by the Newport Fugitives Stat Centre.
What is included
Overview dashboard
Batting, bowling and fielding tables
Player search and profiles
Current/former player status
Automatic run and wicket milestones
Club records
Three statistical Greatest XIs
Mobile-friendly design
Google Sheets CSV connection
GitHub Pages compatible
Connect your real data
Create a Google Sheet with the columns shown in `google-sheet-template.csv`.
Enter your Malpas Cricket Club statistics.
In Google Sheets use File → Share → Publish to web.
Publish the relevant sheet as CSV.
Copy the CSV URL.
Open `index.html` and replace:
`const CSV\_URL = "";`
with your CSV URL.
Commit the file to GitHub.
Enable GitHub Pages for the repository.
The website will fetch the spreadsheet in the visitor's browser, so updating the Google Sheet updates the statistics without rebuilding the site.

Recommended future additions
BPCC club logo
Season-by-season statistics
Teams / age groups
Match results and scorecards
Partnership records
Batting and bowling records by season
Player-of-the-match records
Play-Cricket data import
Admin/update instructions
