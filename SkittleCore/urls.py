from django.conf.urls import patterns, url

from SkittleCore import views

urlpatterns = patterns('',
    url(r'^(?P<specimen>\w+)/(?P<chromosome>[a-zA-Z0-9\-]+)/$', views.index, name='index'),
    url(r'^(?P<specimen>\w+)/(?P<chromosome>[a-zA-Z0-9\-]+)/data\.png$', views.graph, name='graph'),
    url(r'^(?P<specimen>\w+)/(?P<chromosome>[a-zA-Z0-9\-]+)/annotation\.json$', views.annotation, name='annotation'),
    url(r'^data\.png$', views.graph, name='graph'),
    url(r'^state\.json$', views.state, name='state'),
    url(r'^$', views.index, name='index'),
)
