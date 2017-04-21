import json

from rest_framework import status
from rest_framework.response import Response
from users.views.user import AuthorizedView
from taxes.models.tax import TaxEntity,RatePlanTaxDetails,DateRangeTaxDetails
from bson import BSON
from bson import json_util
from datetime import datetime,timedelta

class CreateTax(AuthorizedView):
    def post(self, request):
        detail_list = list()
        data = request.body.decode('utf-8')
        body = json.loads(data)
        product_id = body['product_id']
        details = body['details']
        tax_type = body['tax_type']

        taxEntity = TaxEntity()
        taxEntity.product_id = product_id
        if tax_type == 1:
            for detail in details:
                ratePlanTaxDetails = RatePlanTaxDetails()
                ratePlanTaxDetails.tax_type = detail['tax_type']
                ratePlanTaxDetails.tax_value = detail['tax_value']
                ratePlanTaxDetails.rate_id = detail['rate_id']
                detail_list.append(ratePlanTaxDetails)
            taxEntity.rate_tax = detail_list

        elif tax_type == 2:
            for detail in details:
                dateTaxDetails = DateRangeTaxDetails()
                dateTaxDetails.tax_type = detail['tax_type']
                dateTaxDetails.tax_value = detail['tax_value']
                dateTaxDetails.rate_id = detail['rate_id']
                dateTaxDetails.start = datetime.strptime(str(detail['start']), '%d-%m-%Y').date()
                dateTaxDetails.end = datetime.strptime(str(detail['end']), '%d-%m-%Y').date()
                detail_list.append(dateTaxDetails)

            taxEntity.date_tax = detail_list

        taxEntity.save()
        return Response('created', status=status.HTTP_201_CREATED)

class EditTax(AuthorizedView):
    def put(self, request):
        detail_list = list()
        data = request.body.decode('utf-8')
        body = json.loads(data)
        product_id = body['product_id']
        tax_id = body['tax_id']
        details = body['details']
        tax_type = body['tax_type']

        taxEntity = TaxEntity.objects(id=str(tax_id))[0]
        taxEntity.product_id = product_id
        if tax_type == 1:
            for detail in details:
                ratePlanTaxDetails = RatePlanTaxDetails()
                ratePlanTaxDetails.tax_type = detail['tax_type']
                ratePlanTaxDetails.tax_value = detail['tax_value']
                ratePlanTaxDetails.rate_id = detail['rate_id']
                detail_list.append(ratePlanTaxDetails)
            taxEntity.rate_tax = detail_list

        elif tax_type == 2:
            for detail in details:
                dateTaxDetails = DateRangeTaxDetails()
                dateTaxDetails.tax_type = detail['tax_type']
                dateTaxDetails.tax_value = detail['tax_value']
                dateTaxDetails.rate_id = detail['rate_id']
                dateTaxDetails.start = datetime.strptime(str(detail['start']), '%d-%m-%Y').date()
                dateTaxDetails.end = datetime.strptime(str(detail['end']), '%d-%m-%Y').date()
                detail_list.append(dateTaxDetails)

            taxEntity.date_tax = detail_list

        taxEntity.save()
        return Response('Updates', status=status.HTTP_200_OK)

class ViewTax(AuthorizedView):
    def get(self, request):
        data = request.body.decode('utf-8')
        product_id = request.GET['hotel_id']
        taxes = TaxEntity.objects.filter(product_id=str(product_id)).first()
        if taxes is not None:
            rate_tax_list = list()
            for rate in taxes.rate_tax:
                rate_tax = {
                  "rate_id":rate.rate_id,
                  "tax_type":rate.tax_type,
                  "tax_value":rate.tax_value
                }
                rate_tax_list.append(rate_tax)

            date_tax_list = list()
            for date in taxes.date_tax:
                date_tax = {
                  "rate_id":date.rate_id,
                  "tax_type":date.tax_type,
                  "tax_value":date.tax_value,
                  "start":date.start.strftime('%d-%m-%Y'),
                  "end":date.end.strftime('%d-%m-%Y')
                }
                date_tax_list.append(date_tax)

            tax_data =  {
                'product_id': str(taxes.product_id),
                'rate_tax': rate_tax_list,
                'date_tax': date_tax_list
            }
            return Response(json.loads(json.dumps(tax_data)), status=status.HTTP_200_OK)
