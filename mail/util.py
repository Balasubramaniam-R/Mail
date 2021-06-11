from datetime import timezone
import pytz

def get_time():
    return timezone.localtime(timezone.now()).strftime("%b %d %Y, %I:%M %p")

