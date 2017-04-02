# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from users.views.user import AuthorizedView
import json

from rest_framework import status
from rest_framework.response import Response
from upload.models import Document

class UploadFile(AuthorizedView):
    def post(self, request):
        doc = request.FILES.get('docfile', None)
        newdoc = Document(docfile = doc)
        newdoc.file_path = '21'
        newdoc.save()
        return Response('created', status=status.HTTP_201_CREATED)

# def list(request):
#     # Handle file upload
#     if request.method == 'POST':
#         if True:
#             doc = request.FILES.get('docfile', None)
#             newdoc = Document(docfile = doc)
#             newdoc.file_path = '21'
#             newdoc.save()

#             # Redirect to the document list after POST
#             return HttpResponseRedirect(reverse('upload.views.list'))

#     # Load documents for the list page
#     documents = Document.objects.all()

#     # Render list page with the documents and the form
#     return render_to_response(
#         'list.html',
#         {'documents': documents, 'form': ''},
#         context_instance=RequestContext(request)
#     )
