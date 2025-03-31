BEGIN TRANSACTION;

DROP TABLE IF EXISTS DetailRow;
DROP TABLE IF EXISTS ChannelRow;

CREATE TABLE DetailRow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Details TEXT NOT NULL,
    Value TEXT NOT NULL,
    Status TEXT NOT NULL
);

CREATE TABLE ChannelRow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Channel TEXT NOT NULL,
    Name TEXT NOT NULL,
    Status TEXT NOT NULL
);


INSERT INTO DetailRow (Details, Value, Status) VALUES
    ('Algorithm Version', '1.0', 'Inactive'),
    ('Memory Board', 'Memory Board Ok', 'Inactive'),
    ('HV1r Board', 'No HV Board Failrue', 'Pending'),
    ('NAU13 Board', 'NAU13 Board Failure', 'Active'),
    ('NEU203 Board', 'HEHV Failure, Qualify NEU203', 'Standby');

INSERT INTO ChannelRow (Channel, Name, Status) VALUES
    ('TTAM', 'Temperature Sensor Failure', 'Inactive'),
    ('TLEM', 'Backup Channel', 'Inactive'),
    ('P21V', 'Test Channel', 'Inactive');

COMMIT; 