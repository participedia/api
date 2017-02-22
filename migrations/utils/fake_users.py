import csv
import json

fake_usernames = json.loads(open('members.json').read())
print '{} fake users'.format(len(fake_usernames))
csv_reader = csv.DictReader(open('../data-transport/migrations/users.csv'))
users = [user for user in csv_reader]
print '{} real users'.format(len(users))
print '{} merged'.format(len(zip(users, fake_usernames)))
newusers = [{
    'name': fake['name'].encode('utf-8'),
    'email': fake['email'].encode('utf-8'),
    'accepted_date': real['accepted_date'],
    'id': real['id'],
    'language': real['language'],
    'language_1': real['language_1'],
    'last_access_date': real['last_access_date'],
    'login': real['login']}
     for (fake, real) in zip(fake_usernames, users)]

fieldnames = sorted(users[-1].keys())

with open('migrations/users.csv', 'w') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for user in newusers:
        writer.writerow(user)
