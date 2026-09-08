import diem from './diem';
import µ from './mu';
import countriesData from './countriesData';

function parseLocalDate(dateString) {
    if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return null;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    ) ? date : null;
}

function getCurrentLocalDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDateForInput(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');
}

function isValidStoredUserData(userData) {
    const birthDate = parseLocalDate(userData && userData.dob);

    return (
        userData &&
        typeof userData === 'object' &&
        birthDate &&
        birthDate <= getCurrentLocalDate() &&
        typeof userData.country === 'string' &&
        countriesData.some((country) => country.country === userData.country) &&
        (userData.gender === 'male' || userData.gender === 'female' || userData.gender === false) &&
        Number.isFinite(userData.expectancy) &&
        userData.expectancy > 0
    );
}

const Data = (function() {

    // Initialize the Data Object
    let _now = diem();
    let _globalExpectancy = { v: 71.5, m : 68.3, f : 72.8 };

    // Data.User
    const userDataStorageKey = 'TempusFugit.Data.User';
    const storedUserData = localStorage.getItem(userDataStorageKey);
    let _userData = null;

    if (storedUserData) {
        try {
            const parsedUserData = JSON.parse(storedUserData);
            if (isValidStoredUserData(parsedUserData)) {
                _userData = parsedUserData;
            } else {
                localStorage.removeItem(userDataStorageKey);
            }
        } catch (error) {
            localStorage.removeItem(userDataStorageKey);
        }
    }

    if (!_userData) {

        let dob = (function() {

            return new Array(
                _now.year() - µ.randomInt(18, 35),
                ('00' + µ.randomInt(1,12)).slice(-2),
                ('00' + µ.randomInt(1,28)).slice(-2)
            );
        }()).join('-');
        let gender = ( µ.randomInt(0, 1) ) ? 'male' : 'female';
        let country = false;
        let expectancy = _globalExpectancy.v;

        _userData = { dob, gender, country, expectancy }

    }

        return {
            WorldExpectancy : _globalExpectancy,
            Countries : countriesData.slice().sort( (a, b) => (a.country.toUpperCase() > b.country.toUpperCase()) ? 1 : -1 ),
            User : _userData,
            Update : null,
            Theme : null
        }
}());


const Tempus = {

    validateUserData : function() {

        let _error = false;
        const _inputData = {
            dob : µ('#user-dob').val() || false,
            gender : µ('input[name="user-gender"]:checked').val() || false,
            country : µ('#user-country option:checked').attr('value') || false,
        }

        // Always skip gender validation - gender is optional
        for (var i in _inputData) {
            if (i === 'gender') continue; // Skip gender validation
            if ( _inputData[i] === false ) {
                _error = true;
                break;
            }
        }

        let _countryData = Data.Countries.filter(function(el) { return el.country == _inputData.country }).pop();
        const birthDate = parseLocalDate(_inputData.dob);
        if (_error || !birthDate || birthDate > getCurrentLocalDate() || !_countryData) {
            return false;
        }

        return {
            dob : _inputData.dob,
            gender : _inputData.gender,
            country : _inputData.country,
            // Always use 'v' if gender not selected (optional field)
            expectancy : (!_inputData.gender)
                ? _countryData.v
                : _countryData[(_inputData.gender == 'male') ? 'm' : 'f']
        }
    },

    saveUserData : function(_userData) {

        Data.User = _userData;
        localStorage.setItem('TempusFugit.Data.User', JSON.stringify(_userData));
    },

    deathPassed : function() {
        let _yearMs = 365.25 * 24 * 3600 * 1000;
        let _born = parseLocalDate(Data.User.dob);
        if (!_born) { return true; }

        return ( (Data.User.expectancy * _yearMs) + _born.getTime() ) < Date.now();
    },

    getRandomCountry : function(top = true) {
        return (top)
            ? Data.Countries.sort( (a, b) => (a.v < b.v) ? 1 : -1 )[µ.randomInt(0, Math.floor(Data.Countries.length/3))]
            : Data.Countries[µ.randomInt(0, Data.Countries.length -1)];
    },

    populateUserDataInput : function() {

        // TODO: Move to UI
        // Set input data
        µ('#user-dob').attr('max', formatDateForInput(getCurrentLocalDate()));
        µ('#user-dob').attr('value', Data.User.dob);
        
        // Only pre-check gender if user has a saved gender value
        if (Data.User.gender) {
            µ('#user-gender-' + Data.User.gender ).attr('checked', true);
        }

        Data.Countries.forEach( (el) => {
            let _i = µ('<option>').attr('value', el.country).text( el.country );
                     µ('#user-country').append( _i );
        });

        µ('#user-country option[value="'+ (Data.User.country || Tempus.getRandomCountry()['country']) +'"]').attr('selected','selected');
    },

    // Tempus.generate
    generateDatePoints : function() {
        let _yearMs = 365.25 * 24 * 3600 * 1000;
        let _monthMs = _yearMs/12;
        let _dayMs = 24 * 3600 * 1000;

        let _born = diem(parseLocalDate(Data.User.dob).getTime());
        let _now = diem();
        let _death = diem((Data.User.expectancy * _yearMs) + _born.instant());

        let death = _death.output();

        let _remaining = _death.instant() - _now.instant();
        if ( _remaining < 0 ) { _remaining = 0 }

        let years = Math.floor(_remaining/_yearMs);
            years = years.toString().padStart(2, '0');
        let months = Math.floor((_remaining/_monthMs) - (years*12));
            months = months.toString().padStart(2, '0');
        let days = Math.floor((_remaining/_dayMs) - ((years*365.25) + (months*(365.25/12))));
            days = days.toString().padStart(2, '0');

        return { years, months, days, death }
    },

    generateTimePoints : function() {

        if ( Tempus.deathPassed() ) { return { hours: '00', minutes: '00', seconds: '00' } }

        let _dayMs = 24 * 3600 * 1000;
        let _hourMs = 3600 * 1000;
        let _minMs = 60 * 1000;

        let _now = diem();

        let _presentDay = new Date(_now.instant());
            _presentDay.setHours(0, 0, 0, 0);
            _presentDay = diem(_presentDay.getTime());

        let _dayPassed = _now.instant() - _presentDay.instant();
        let _dayRemainingMs = _dayMs - _dayPassed;

        let hours = Math.floor(_dayRemainingMs/_hourMs);
            hours = hours.toString().padStart(2, '0');
        let minutes = Math.floor((_dayRemainingMs/_minMs) - (hours*60));
            minutes = minutes.toString().padStart(2, '0');
        // let seconds = (_dayRemainingMs - ((hours*_hourMs) + (minutes*_minMs)))/1000;
        //     seconds = seconds%60;
        //     seconds = seconds.toFixed(1).padStart(4, '0');

        let seconds = Math.floor((_dayRemainingMs - ((hours*_hourMs) + (minutes*_minMs)))/1000);
            seconds = seconds.toFixed(0).padStart(2, '0');

        return { hours, minutes, seconds };
    },

    init : function() {

        let _theme = (!!localStorage.getItem('TempusFugit.Data.Theme')) ? localStorage.getItem('TempusFugit.Data.Theme') : null;
        let _userData = !!localStorage.getItem('TempusFugit.Data.User');

        // Count how many times the application has been started on the app view
        if ( _userData ) {
            let _appStarts = parseInt(localStorage.getItem('TempusFugit.Data.AppStarts') || '0', 10) + 1;
            localStorage.setItem('TempusFugit.Data.AppStarts', _appStarts);
        }

        Tempus.populateUserDataInput();
        Tempus.UI.theme.render();
        Tempus.UI.theme.set( _theme );

        if ( _userData ) {  Tempus.UI.view.app();   }
        else {              Tempus.UI.view.intro(); }

        Tempus.UI.loaded();
    },

    UI : {
        loaded : function() {
            µ('#loader').addClass('hidden');
            setTimeout( () => { µ('#loader').remove() }, 500 );
        },

        view : {
            intro : function() {
                Tempus.UI.settings.show();
                µ('body').addClass('intro');
                µ('.intro #user-data-save').on('click', () => {

                    let _validate = Tempus.validateUserData();
                    if ( _validate ) {

                        µ('#user-data-error').html('');
                        Tempus.saveUserData(_validate)
                        Tempus.UI.view.app();

                    } else {

                        µ('#user-data-error').html('<strong>!</strong> Please, complete this form!');
                    }
                });

            },
            app : function() {

                Tempus.generateDatePoints();
                Tempus.generateTimePoints();
                Tempus.UI.settings.hide();
                Tempus.UI.update();

                µ('body').removeClass('intro');
                µ('body').addClass('app')

                µ('.app #open-settings').on('click', e => {
                    e.preventDefault();
                    Tempus.UI.settings.show();
                    Tempus.UI.pause();
                })

                µ('.app #close-settings').on('click', e => {
                    e.preventDefault();
                    Tempus.UI.settings.hide();
                    Tempus.UI.update();
                })
                µ('.app #user-data').on('click', e => {
                    if ( e.target.id == 'user-data') {
                        Tempus.UI.settings.hide();
                        Tempus.UI.update();
                    }
                });
                µ('.app #user-data-save').on('click', () => {

                    let _validate = Tempus.validateUserData();
                    if ( _validate ) {

                        µ('#user-data-error').html('');
                        Tempus.saveUserData(_validate)
                        Tempus.UI.settings.hide();
                        Tempus.UI.update();

                    } else {

                        µ('#user-data-error').html('<strong>!</strong> Please, complete this form!');
                    }
                });

                µ("input[name='user-theme']").on('change', function() {
                    let _theme = µ('input[name="user-theme"]:checked').val();
                    Tempus.UI.theme.set(_theme, true)
                });

                // Only auto-show the info message when the app has been started 3 times or fewer
                if ( parseInt(localStorage.getItem('TempusFugit.Data.AppStarts') || '0', 10) <= 3 ) {
                    Tempus.UI.counterInfo.show();
                    window.setTimeout(() => { Tempus.UI.counterInfo.hide() }, 5000);
                }
                µ('#clock').on('mouseenter', () => { Tempus.UI.counterInfo.show() });
                µ('#clock').on('mouseleave', () => { Tempus.UI.counterInfo.hide() });


                µ(document).on('visibilitychange', () => {

                    if ( document.visibilityState !== 'visible' ) {
                        Tempus.UI.pause();
                    } else {
                        Tempus.UI.update();
                    }
                });

            }
        },

        update : function() {

            function updateDate() {
                let _datestamp = Tempus.generateDatePoints();

                µ('#tempus-years strong').html(_datestamp.years);
                µ('#tempus-months strong').html(_datestamp.months);
                µ('#tempus-days strong').html(_datestamp.days);

                µ('#tempus-death-string').html(_datestamp.death);
            }

            function updateTime() {
                let _timestamp = Tempus.generateTimePoints();

                µ('#tempus-seconds strong').html(_timestamp.seconds);
                µ('#tempus-minutes strong').html(_timestamp.minutes);
                µ('#tempus-hours strong').html(_timestamp.hours);

                if ( parseFloat(_timestamp.seconds) <= 0) {
                    updateDate()
                }

                // Hold the clock at 0 and stop once the death date has passed
                if ( Tempus.deathPassed() && Data.Update != null ) {
                    window.clearInterval(Data.Update);
                    Data.Update = null;
                }
            }

            if (Data.Update == null) {

                updateDate();
                updateTime();

                if ( Tempus.deathPassed() ) { return }

                Data.Update = window.setInterval(updateTime, 1000);
            }
        },

        pause : function() {

            window.clearInterval(Data.Update)
            Data.Update = null;
        },

        counterInfo : {
            isVisible : false,
            show : function() {
                Tempus.UI.counterInfo.isVisible = true;
                µ('#clock .clock-info').addClass('visible');
            },
            hide : function() {
                Tempus.UI.counterInfo.isVisible = false;
                µ('#clock .clock-info').removeClass('visible');
            }
        },

        theme : {

            styles : [
                { name : 'night' },
                { name : 'forest' },
                { name : 'sunset' },
                { name : 'ocean' },
                { name : 'sunrise' }
            ],
            render : function() {
                let tplContainer = µ('#user-data .theme');
                let tpl = tplContainer.html();
                let output = [];
                Tempus.UI.theme.styles.forEach((el) => {
                    output.push( tpl.replace(/{style}/gi, el.name).trim() );
                });
                tplContainer.html( output.join('') );
            },

            set : function(theme, save = false) {

                let _theme = theme || Tempus.UI.theme.styles[µ.randomInt(0, Tempus.UI.theme.styles.length-1)].name;

                // TODO: Check if theme param is within array items

                Tempus.UI.theme.styles.forEach((el) => {
                    if ( µ('body').els[0].classList.contains(el.name) ) { µ('body').removeClass(el.name) }
                })
                µ('body').addClass(_theme);

                // Save on memory when user selects one of them
                if (save) { localStorage.setItem('TempusFugit.Data.Theme', _theme); }
            }
        },

        settings : {

            isVisible : false,
            show : function() {
                Tempus.UI.settings.isVisible = true;
                µ('#user-data').addClass('visible');

                µ('#open-settings').removeClass('visible');
                µ('#close-settings').addClass('visible');
            },

            hide : function() {
                Tempus.UI.settings.isVisible = false;
                µ('#user-data').removeClass('visible')

                µ('#open-settings').addClass('visible');
                µ('#close-settings').removeClass('visible');
            }
        }
    }
}


Tempus.init();
