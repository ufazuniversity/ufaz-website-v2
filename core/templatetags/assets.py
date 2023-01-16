from django import template
from django.utils import safestring
from django.conf import settings
import os
import json

register = template.Library()


class AssetLoader:
    def __init__(self, manifest_path: str, assets_dir: str):
        self.assets_dir = assets_dir
        if not manifest_path:
            raise Exception("Manifest file path is required")
        self.manifest = self.load_manifest(manifest_path)

    @staticmethod
    def load_manifest(manifest_path: str) -> dict:
        with open(manifest_path) as f:
            return json.load(f)

    def render_asset(self, name: str) -> str:
        # Check the name and render based on the extension
        return ""

    def get_css_tag(self, css_file: str) -> str:
        path = os.path.join(self.assets_dir, "css", css_file)
        return f'<link rel="stylesheet" href="{path}">'

    def get_script_tag(self, js_file: str) -> str:
        # Return Javascript module supported script tag
        path = os.path.join(self.assets_dir, "js", js_file)
        return f'<script type="module" src="{path}"></script>'


@register.simple_tag
@safestring.mark_safe
def asset(name):
    ...
