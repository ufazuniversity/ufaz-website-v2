from django import template
from django.utils import safestring
from django.conf import settings
import os
import json

register = template.Library()

JS = "js"
CSS = "css"

MANIFEST_PATH = settings.GULP_MANIFEST_PATH
ASSETS_ROOT = settings.GULP_BUILD_DIR


def stringify(*args, **kwargs) -> str:
    props = " ".join(args)
    attrs = " ".join([f"{k}={v}" for k, v in kwargs.items()])
    return f"{props} {attrs}"


class AssetLoader:
    def __init__(self, manifest_path: str, assets_root: str):
        self.assets_root = assets_root
        if not manifest_path:
            raise Exception("Manifest file path is required")
        self.manifest = self.load_manifest(manifest_path)

    @staticmethod
    def load_manifest(manifest_path: str) -> dict:
        with open(manifest_path) as f:
            return json.load(f)

    def render_assets(self, name: str, ext: str = None, *args, **kwargs) -> str:
        if name not in self.manifest:
            raise template.TemplateSyntaxError(
                f"Asset name, {name} not found in manifest"
            )
        if ext is not None:
            filename = self.get_asset_value(name, ext)
            return self.get_single_asset(filename, ext, *args, **kwargs)
        ret = ""
        for ext, filename in self.manifest[name]:
            ret += self.get_single_asset(filename, ext, *args, **kwargs) + "\n"

    def get_single_asset(self, filename: str, ext: str, *args, **kwargs):
        path = self.get_url(ext, filename)
        if ext == CSS:
            return self.get_css_tag(path, *args, **kwargs)
        elif ext == JS:
            return self.get_script_tag(path, *args, **kwargs)

    def get_url(self, *args):
        return settings.STATIC_URL + os.path.join(self.assets_root, *args)

    def get_asset_value(self, *keys) -> str:
        try:
            val = self.manifest
            for key in keys:
                val = val[key]
            return val
        except KeyError:
            raise template.TemplateSyntaxError(f"Asset with keys, {keys} not found")

    @staticmethod
    def get_css_tag(path: str, *args, **kwargs) -> str:
        return f'<link rel="stylesheet" href="{path}" {stringify(*args, **kwargs)}">'

    @staticmethod
    def get_script_tag(path: str, *args, **kwargs) -> str:
        # Return Javascript module supported script tag
        return (
            f'<script type="module" src="{path}" {stringify(*args, **kwargs)}></script>'
        )


asset_loader = AssetLoader(manifest_path=MANIFEST_PATH, assets_root=ASSETS_ROOT)


@register.simple_tag
@safestring.mark_safe
def asset(name, ext: str = None, *args, **kwargs) -> str:
    if name is None or name == "":
        raise template.TemplateSyntaxError("Name is required")
    if ext is not None and ext not in [JS, CSS]:
        raise template.TemplateSyntaxError(f"Incorrect extension, {ext}")
    return asset_loader.render_assets(name, ext, *args, **kwargs)
