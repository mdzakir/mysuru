# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse

from upload.models import Document

def list(request):
    # Handle file upload
    if request.method == 'POST':
        if True:
            newdoc = Document(docfile = request.FILES['docfile'])
            newdoc.file_path = '21'
            newdoc.save()

            # Redirect to the document list after POST
            return HttpResponseRedirect(reverse('upload.views.list'))

    # Load documents for the list page
    documents = Document.objects.all()

    # Render list page with the documents and the form
    return render_to_response(
        'list.html',
        {'documents': documents, 'form': ''},
        context_instance=RequestContext(request)
    )
