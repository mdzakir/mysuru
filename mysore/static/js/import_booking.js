( function ( document, window, index ) {
    var inputs = document.querySelectorAll( '.upload-file-input' );
    Array.prototype.forEach.call( inputs, function( input ) {
        var label	 = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener( 'change', function( e ) {
            var fileName = '';
            if( this.files && this.files.length > 1 )
                fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
            else
                fileName = e.target.value.split( '\\' ).pop();

            if( fileName )
                label.querySelector( 'span' ).innerHTML = fileName;
            else
                label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
        input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
    });
}( document, window, 0 ));

$(function(){
    $('#hotel_id').val($('.hotelSelectedHidden').val());
    $('.hotelname-gr').html($('#sel-hotel option:selected').text())

    $('#sel-hotel').on('change', function(){
        $('.hotelname-gr').html($('#sel-hotel option:selected').text())
        $('#hotel_id').val($('#sel-hotel').val());
    });


    $('.ihd-main-wrapper').on('change', '.upload-file-field input', function(){

        $('#hotel_id').val($('.hotelSelectedHidden').val());

        $('.prize-optimize-url').attr('href', '/pages/priceOptimizer?id='+$('#hotel_id').val());

        $('loading').html('loading...');

        $('.processing--display').show();

        $('.import-error-alert').hide();
        var form_data = new FormData($('#fileUploadForm')[0]);

        $.ajax({
            type: 'POST',
            url: '/uploadfile/',
            data: form_data,
            contentType: false,
            processData: false,
            async: true,
            success: function(data) { importSuccess(data) },
            error: function (argument) {
                $('.processing--display').hide();
                $('.import-error-alert').show();
            }
        });
    });
});

function importSuccess(data) {

    var passed_rec='';

    var obj = JSON.parse(data);

    var rootScope = angular.element(document.body).injector().get('$rootScope');
    rootScope.$broadcast('bookingsImported');

    //{"duplicate": 168, "failed_count": 3, "pass_count": 17, "modify_count": 0}
    $('.pass-count').text(obj.pass_count);
    $('.dup-count').text(obj.duplicate);
    $('.modify-count').text(obj.modify_count);
    $('.failed-count').text(obj.failed_count);

    $('#total-records .table tbody').html(data);
    $('#passed-records .table tbody').html(passed_rec);

    $('.processing--display').show();
    $('.processing--display').hide();
    $('.import-error-alert').hide();
    $('.ihd-upload-file').slideUp('fast');
    $('.import-processed-alert').show();
    $('.ihd-summary-wrapper').show();
}