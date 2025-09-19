Schema change: Competitions table – ResultAnnounceDate column

Context
We need to allow admins to declare results and make them visible to users from a specific date.

Change
- Add a nullable column ResultAnnounceDate to Competitions.

SQL to apply manually

ALTER TABLE Competitions
ADD ResultAnnounceDate DATETIME2 NULL;

Notes
- Backend writes to this column via competitionService.declareResult().
- User-facing apps can enable “View Result” once the current UTC time >= ResultAnnounceDate.

