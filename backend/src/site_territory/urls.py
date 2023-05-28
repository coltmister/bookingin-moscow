from django.urls import path

from site_territory.feedback.views import SiteFeedbackDetailView, SiteFeedbackLandlordView, SiteFeedbackView
from site_territory.files.views import SiteFileView, SitePhotoView, TerritoryFileView, TerritoryPhotoView
from site_territory.territory.add_fields.views import AddFieldValueView, AddFieldValueViewDetail, AddFieldView, \
    AddFieldViewDetail
from site_territory.territory.add_services.views import AddServiceView, AddServiceViewDetail
from site_territory.territory.views import CategoryView, CategoryViewDetail, TerritoriesView, TerritorySettingsView, \
    TerritoryViewDetail
from site_territory.views import AiSuggestSites, SiteView, SiteViewActive, SiteViewBlock, SiteViewConfirm, \
    SiteViewDetail, SubdomainRedirectView, SubdomainView, SuggestAddressView, UndergroundView

urlpatterns = [
    path('sites', SiteView.as_view()),
    path('sites/recommend', AiSuggestSites.as_view()),
    # uuid urls
    path('sites/<uuid:site_id>', SiteViewDetail.as_view()),
    path('sites/<uuid:site_id>/confirm', SiteViewConfirm.as_view()),
    path('sites/<uuid:site_id>/block', SiteViewBlock.as_view()),
    path('sites/<uuid:site_id>/active', SiteViewActive.as_view()),

    path('sites/<uuid:uuid>/photos', SitePhotoView.as_view()),
    path('sites/<uuid:uuid>/photos/<uuid:file_id>', SitePhotoView.as_view()),
    path('sites/<uuid:uuid>/files', SiteFileView.as_view()),
    path('sites/<uuid:uuid>/files/<uuid:file_id>', SiteFileView.as_view()),
    path('sites/<uuid:site_id>/feedbacks', SiteFeedbackView.as_view()),
    path('sites/<uuid:site_id>/subdomain', SubdomainView.as_view()),

    # slug urls
    path('sites/<slug:site_slug>', SiteViewDetail.as_view()),
    path('sites/<slug:site_slug>/confirm', SiteViewConfirm.as_view()),
    path('sites/<slug:site_slug>/block', SiteViewBlock.as_view()),
    path('sites/<slug:site_slug>/active', SiteViewActive.as_view()),

    path('sites/<slug:site_slug>/photos', SitePhotoView.as_view()),
    path('sites/<slug:site_slug>/photos/<uuid:file_id>', SitePhotoView.as_view()),
    path('sites/<slug:site_slug>/files', SiteFileView.as_view()),
    path('sites/<slug:site_slug>/files/<uuid:file_id>', SiteFileView.as_view()),
    path('sites/<slug:site_slug>feedbacks', SiteFeedbackView.as_view()),
    path('sites/<slug:site_slug>/subdomain', SubdomainView.as_view()),

    path('sites/<uuid:site_id>/territories', TerritoriesView.as_view()),
    path('sites/<slug:site_slug>/territories', TerritoriesView.as_view()),

    path('territories/<uuid:territory_id>', TerritoryViewDetail.as_view()),
    path('territories/<uuid:uuid>/files', TerritoryFileView.as_view()),
    path('territories/<uuid:uuid>/files/<uuid:file_id>', TerritoryFileView.as_view()),
    path('territories/<uuid:uuid>/photos', TerritoryPhotoView.as_view()),
    path('territories/<uuid:uuid>/photos/<uuid:file_id>', TerritoryPhotoView.as_view()),
    path('territories/<uuid:territory_id>/settings', TerritorySettingsView.as_view()),
    path('territories/<uuid:territory_id>/additional-services', AddServiceView.as_view()),
    path('territories/<uuid:territory_id>/additional-services/<uuid:service_id>', AddServiceViewDetail.as_view()),
    path('territories/<uuid:territory_id>/additional-fields-values', AddFieldValueView.as_view()),
    path('territories/<uuid:territory_id>/additional-fields-values/<uuid:add_field_value_id>',
         AddFieldValueViewDetail.as_view()),

    path('categories', CategoryView.as_view()),
    path('categories/<uuid:category_id>', CategoryViewDetail.as_view()),
    path('categories/<uuid:category_id>/additional-fields', AddFieldView.as_view()),
    path('categories/<uuid:category_id>/additional-fields/<uuid:add_field_id>', AddFieldViewDetail.as_view()),

    path('common/feedbacks', SiteFeedbackView.as_view()),
    path('common/feedbacks/<uuid:feedback_id>', SiteFeedbackDetailView.as_view()),
    path('common/feedbacks/<uuid:feedback_id>/landlord-answer', SiteFeedbackLandlordView.as_view()),
    path('common/redirect', SubdomainRedirectView.as_view()),
    path('common/suggest', SuggestAddressView.as_view()),
    path('common/underground', UndergroundView.as_view()),

]
