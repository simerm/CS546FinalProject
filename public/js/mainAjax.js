//ajax operations 

jQuery(document).ready(function() {
    jQuery('#addStockForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission
        const selectedOption = jQuery('#add-stock').val();

        let requestConfig = {
            method: 'PATCH',
            url: `/addToStock/${selectedOption}`,
            option: selectedOption,
            contentType: 'application/json'
        };

        jQuery.ajax(requestConfig).then(function(response) {
            console.log("op")
            jQuery('#stock-list ul').append('<li>' + selectedOption + '</li>');
            console.log("hi")
            jQuery('#remove-stock').append('<option value="' + selectedOption + '">' + selectedOption + '</option>');

        }).catch(function(err) {
            console.error('Error adding to stock:', err);
        });
    });

    jQuery('#removeStockForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission
        const selectedOption = jQuery('#remove-stock').val();

        let requestConfig = {
            method: 'PATCH',
            url: `/removeFromStock/${selectedOption}`,
            contentType: 'application/json'
        };

        jQuery.ajax(requestConfig).then(function(response) {
            jQuery('#stock-list li').each(function() {
                if (jQuery(this).text().trim() === selectedOption) {
                    jQuery(this).remove();
                }
            });

            jQuery('#remove-stock option[value="' + selectedOption + '"]').remove();

        }).catch(function(err) {
            console.error('Error removing from stock:', err);
        });
    });
});
