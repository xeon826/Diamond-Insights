from django.shortcuts import render
from .models import Player
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import HttpResponse
import requests
from openai import OpenAI
import os

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)


def edit_player(request, player_id):
    try:
        player = Player.objects.get(id=player_id)
    except Player.DoesNotExist:
        return JsonResponse({'error': 'Player not found'}, status=404)

    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
        except Exception:
            body = {}

        for field, value in body.items():
            if hasattr(player, field):
                setattr(player, field, value)
        player.save()
        return JsonResponse({'status': 'success', 'player_id': player.id})

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def query_openai(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            prompt = body.get('prompt', '')
        except Exception:
            prompt = ''
        response = client.responses.create(
            model="gpt-4-turbo",
            instructions="You are a sports expert. Provide a summary based on the player statistics data. Keep your response under 200 words.",
            input=prompt,
        )
        return JsonResponse({'response': response.output_text})
    return JsonResponse({'error': 'Invalid request method'}, status=405)


def get_player_stats(request):
    ordering = request.GET.get("ordering")
    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 10))
    qs = Player.objects.all()
    if ordering:
        ordering_fields = [field.strip() for field in ordering.split(",")]
        qs = qs.order_by(*ordering_fields)
    total = qs.count()
    start = (page - 1) * page_size
    end = start + page_size
    players = list(qs.values()[start:end])
    return JsonResponse({"results": players, "total": total})


def refresh_data(request):
    response = requests.get("https://api.hirefraction.com/api/test/baseball")
    players_data = response.json()
    for pdata in players_data:
        caught_stealing_val = pdata.get("Caught stealing", 0)
        if caught_stealing_val == "--":
            caught_stealing_val = 0
        else:
            caught_stealing_val = int(caught_stealing_val)
        Player.objects.update_or_create(
            player_name=pdata.get("Player name", ""),
            defaults={
                "position": pdata.get("position", ""),
                "games": pdata.get("Games", 0),
                "at_bat": pdata.get("At-bat", 0),
                "runs": pdata.get("Runs", 0),
                "hits": pdata.get("Hits", 0),
                "double_2b": pdata.get("Double (2B)", 0),
                "third_baseman": pdata.get("third baseman", 0),
                "home_run": pdata.get("home run", 0),
                "run_batted_in": pdata.get("run batted in", 0),
                "a_walk": pdata.get("a walk", 0),
                "strikeouts": pdata.get("Strikeouts", 0),
                "stolen_base": pdata.get("stolen base", 0),
                "caught_stealing": caught_stealing_val,
                "avg": pdata.get("AVG", 0),
                "on_base_percentage": pdata.get("On-base Percentage", 0),
                "slugging_percentage": pdata.get("Slugging Percentage", 0),
                "on_base_plus_slugging": pdata.get("On-base Plus Slugging", 0),
            },
        )
    return JsonResponse({"status": "success", "players_saved": len(players_data)})
