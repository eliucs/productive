function getRegionCode(regionName) {
    switch (regionName) {
        case 'Ontario':
            return 'ON';
            break;
        case 'Quebec':
            return 'QC';
            break;
        case 'Nova Scotia':
            return 'NS';
            break;
        case 'New Brunswick':
            return 'NB';
            break;
        case 'Manitoba':
            return 'MB';
            break;
        case 'British Columbia':
            return 'BC';
            break;
        case 'Prince Edward Island':
            return 'PE';
            break;
        case 'Saskatchewan':
            return 'SK';
            break;
        case 'Alberta':
            return 'AB';
            break;
        case 'Newfoundland and Labrador':
            return 'NB';
            break;
        case 'Northwest Territories':
            return 'NT';
            break;
        case 'Yukon':
            return 'YT';
            break;
        case 'Nunavut':
            return 'NU';
            break;
        default:
            return regionName.substr(0, 2).toUpperCase();
            break;
    }
}
