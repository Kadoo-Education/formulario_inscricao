import csv

class ParticipantManager:
    def __init__(self, csv_path):
        self.available = []
        self.winners = []
        self.load(csv_path)

    def load(self, path):
        seen_emails = set()
        with open(path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['email'] not in seen_emails:
                    self.available.append(row)
                    seen_emails.add(row['email'])

    def pick_winner(self):
        import random
        if not self.available:
            return None
        return random.choice(self.available)

    def confirm_winner(self, person):
        if person in self.available:
            self.available.remove(person)
            self.winners.append(person)

    def remove_absent(self, person):
        if person in self.available:
            self.available.remove(person)

    def save_report(self):
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M")
        filename = f"relatorio_sorteio_{timestamp}.csv"
        with open(filename, mode='w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['time', 'full_name', 'email'])
            writer.writeheader()
            writer.writerows(self.winners)
        return filename
