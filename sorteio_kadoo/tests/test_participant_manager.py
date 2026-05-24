import pytest
import csv
import os
from participant_manager import ParticipantManager

def test_load_participants(tmp_path):
    csv_file = tmp_path / "test.csv"
    content = "time,full_name,email\nTeam A,User 1,u1@test.com\nTeam A,User 1,u1@test.com\nTeam B,User 2,u2@test.com"
    csv_file.write_text(content)
    
    manager = ParticipantManager(str(csv_file))
    # Should ignore duplicates by email
    assert len(manager.available) == 2
    assert manager.available[0]['full_name'] == "User 1"
    assert manager.available[1]['full_name'] == "User 2"

def test_pick_winner(tmp_path):
    csv_file = tmp_path / "test.csv"
    content = "time,full_name,email\nTeam A,User 1,u1@test.com"
    csv_file.write_text(content)
    
    manager = ParticipantManager(str(csv_file))
    winner = manager.pick_winner()
    assert winner['full_name'] == "User 1"

def test_confirm_winner(tmp_path):
    csv_file = tmp_path / "test.csv"
    content = "time,full_name,email\nTeam A,User 1,u1@test.com"
    csv_file.write_text(content)
    
    manager = ParticipantManager(str(csv_file))
    winner = manager.available[0]
    manager.confirm_winner(winner)
    
    assert len(manager.available) == 0
    assert len(manager.winners) == 1
    assert manager.winners[0] == winner

def test_remove_absent(tmp_path):
    csv_file = tmp_path / "test.csv"
    content = "time,full_name,email\nTeam A,User 1,u1@test.com"
    csv_file.write_text(content)
    
    manager = ParticipantManager(str(csv_file))
    person = manager.available[0]
    manager.remove_absent(person)
    
    assert len(manager.available) == 0
    assert len(manager.winners) == 0
