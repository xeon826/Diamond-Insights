from django.db import models

class Player(models.Model):
    player_name = models.CharField(max_length=100, default="")
    position = models.CharField(max_length=50, default="")
    games = models.IntegerField(default=0)
    at_bat = models.IntegerField(default=0)
    runs = models.IntegerField(default=0)
    hits = models.IntegerField(default=0)
    double_2b = models.IntegerField(default=0)
    third_baseman = models.IntegerField(default=0)
    home_run = models.IntegerField(default=0)
    run_batted_in = models.IntegerField(default=0)
    a_walk = models.IntegerField(default=0)
    strikeouts = models.IntegerField(default=0)
    stolen_base = models.IntegerField(default=0)
    caught_stealing = models.IntegerField(default=0)
    avg = models.FloatField(default=0)
    on_base_percentage = models.FloatField(default=0)
    slugging_percentage = models.FloatField(default=0)
    on_base_plus_slugging = models.FloatField(default=0)

    class Meta:
        db_table = 'player'
