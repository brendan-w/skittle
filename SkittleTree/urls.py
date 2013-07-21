from django.conf.urls import patterns, include, url
from django.views.generic import RedirectView, TemplateView

# Uncomment the next two lines to enable the admin:
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
   # Examples:
   url(r'^$', 'SkittleTree.views.home', name='home'),
   url(r'^browse/', include('SkittleCore.urls')),
   url(r'^discover/', include('DNAStorage.urls')),
   url(r'^23andMe/', RedirectView.as_view(url='/browse/homo/sapiens/hg19/chrY/?graphs=an')),
   # url(r'^$', include('SkittleCore.urls')),
   url(r'^googlef44684f34c2340e5.html$', 'SkittleTree.views.google'),

   # Uncomment the admin/doc line below to enable admin documentation:
   # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

   # Uncomment the next line to enable the admin:
   url(r'^admin/', include(admin.site.urls)),
   url(r'^sendFeedback$', 'SkittleTree.views.feedbackSend'),
   (r'^learn/?$', RedirectView.as_view(url='/browse/homo/sapiens/hg19/chrY/?graphs=abn&start=1468365&scale=1&width=105#learn')),
   (r'^card/?$', TemplateView.as_view(template_name='bizcard.html')),
)
