# Django settings for SkittleTree project.
import os, socket, inspect

'''Recursive check for an element that matches the target'''    
def recursiveContains(elements, target):
    if type(elements) == type('') and target in elements:
        return True
    elif not hasattr(elements, '__iter__'):
        return False
    checks = map(lambda x: recursiveContains(x, target), elements)
    return checks

def toplevelContains(elements, target):
    hits = recursiveContains(elements, target)
    print hits
    return any(hits)

DEBUG = True
TEMPLATE_DEBUG = DEBUG

if socket.gethostname().startswith('nyx'):
    caller = inspect.stack()

    if toplevelContains(caller, "manage.py"):
        SkittleTreeLoc = os.getcwd() + "/"
    else:
        SkittleTreeLoc = os.getcwd() + "/skittle/"
    SkittleTreeURL = "http://skittle.newlinetechnicalinnovations.com/"
else:
    SkittleTreeLoc = os.getcwd() + "/"
    SkittleTreeURL = "http://localhost:5000/"

ADMINS = (
    ('Josiah Seaman', 'josiah@newlinetechnicalinnovations.com'),
    ('Bryan Hurst', 'bryan@newlinetechnicalinnovations.com'),
    ('Marshall Smith', 'marshall@newlinetechnicalinnovations.com'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'SkittleTree',                      # Or path to database file if using sqlite3.
        'USER': 'skittle',                      # Not used with sqlite3.
        'PASSWORD': 'sk!77l3PandaDatabase%',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Denver'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'
os.environ['LANG'] = 'en_US.UTF-8'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = SkittleTreeLoc + 'media/'

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = SkittleTreeURL + 'media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = SkittleTreeLoc + 'static/'

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = SkittleTreeURL + 'static/'

# Additional locations of static files
STATICFILES_DIRS = (
    #'/Users/marshallds/Sites/Skittle/master/SkittleCore/UI/',
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    SkittleTreeLoc + 'SkittleCore/UI/assets/',
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '!#@$t98ergv0h245@$%$Y$25fdsagqw4t897yqhrwedvg!#$!#$'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'SkittleTree.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'SkittleTree.wsgi.application'

TEMPLATE_DIRS = (
    #'/Users/marshallds/Sites/Skittle/master/SkittleCore/UI/',
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    SkittleTreeLoc + 'SkittleCore/UI/'
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'SkittleCore.Graphs',
    'SkittleCore',

    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
)

INTERNAL_IPS = ('127.0.0.1')

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}
