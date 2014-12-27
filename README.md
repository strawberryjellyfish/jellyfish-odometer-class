jellyfish-odometer
==================

An animated JavaScript / CSS generated retro odometer style counter that was originally developed for my WordPress plugin http://strawberryjellyfish.com/wordpress-plugins/jellyfish-counter

The odometer was originally inspired by Gavin Brock's CSS/JavaScript Animated Odometer (Odometer.js) http://gavcode.wordpress.com/2008/04/07/cssjavascript-animated-odometer/

It's been extended and now pretty much totally rewritten to include the functionality desired for the WordPress plugin.

I decided to split Jellyfish-odometer.js off into a separate project because the JavaScript is pretty much its own thing as should probably develop as such. It is still a standalone JavaScript class that has no specific ties to WordPress and could well be useful in non WP projects.

## Example

Live demo of the WordPress plugin using this JavaScript can be seen here http://strawberryjellyfish.com/wordpress-plugins/jellyfish-counter

This will demonstrate what jellyfish-odometer does at least.

Standalone examples... TODO

## Usage

You should be able to figure out how to use this from studying the examples on the Jellyfish Counter WordPress plugin page above... real documentation is TODO

In summary, set up a html div with suitable data attributes and on document ready create a new JellyfishOdometer object passing the element.

## Future

This will probably become a real jQuery plugin at some point, which may make the standalone odometer implementation slightly less awkward.

## Want to contribute?

Feel free to use github to fork or pull request

## License

GPLv2 http://www.gnu.org/licenses/gpl-2.0.html