from django.db import models
from modelcluster import fields as mc_fields
from wagtail import models as wg_models
from wagtail import fields as wg_fields
from wagtail.search import index
from wagtail.admin import panels

class Page(wg_models.Page):

    featured_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    body = wg_fields.RichTextField()

    search_fields = wg_models.Page.search_fields + [
        index.SearchField('body'),
    ]

    content_panels = wg_models.Page.content_panels + [
        panels.FieldPanel('body'),
        panels.InlinePanel('related_links', heading="Related links", label="Related link")
    ]

    promote_panels = [
        panels.MultiFieldPanel(wg_models.Page.promote_panels, "Common page configuration"),
        panels.FieldPanel('featured_image')
    ]


class PageRelatedLink(wg_models.Orderable):
    page = mc_fields.ParentalKey(Page, on_delete=models.CASCADE, related_name='related_links')
    name = models.CharField(max_length=255)
    url = models.URLField()

    panels = [
        panels.FieldPanel('name'),
        panels.FieldPanel('url')
    ]