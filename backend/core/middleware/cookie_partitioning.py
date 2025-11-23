from django.utils.deprecation import MiddlewareMixin
from http import cookies

cookies.Morsel._flags.add("partitioned")
cookies.Morsel._reserved.setdefault("partitioned", "Partitioned")

class CookiePartitioningMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        for name in ("sessionid", "csrftoken"):
            morsel = response.cookies.get(name)
            if morsel:
                if morsel.get("samesite") == "None" and morsel.get("secure"):
                    morsel["Partitioned"] = True
        return response
