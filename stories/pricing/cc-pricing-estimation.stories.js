// Don't forget to import the component you're presenting!
import '../../src/pricing/cc-pricing-estimation.js';
import {makeStory, storyWait} from '../lib/make-story.js';
import {enhanceStoriesNames} from '../lib/story-names.js';

export default {
    title: '$ pricing/<cc-pricing-estimation>',
    // This component name is used by Storybook's docs page for the API table.
    // It will use `custom-elements.json` documentation file.
    // Run `npm run components:docs-json` to generate this JSON file.
    component: 'cc-pricing-estimation',
};

const conf = {
    component: 'cc-pricing-estimation',
    // You may need to add some CSS just for your stories.
    // It's often needed to add some margin around your component.
    // language=CSS
    css: `cc-pricing-estimation {
        margin-bottom: 1rem;
    }`,
};
const pgExample = {
    productName: "Postgresql",
    "item": {
        "name": "XS Small Space",
        "price": 17.5,
        "features": [{"name": "Backups", "value": "Daily - 7 Retained"}, {
            "name": "Max DB size",
            "value": "5 GB"
        }, {"name": "Metrics", "value": "Yes"}, {"name": "PostGIS", "value": "Yes"}, {
            "name": "Type",
            "value": "Dedicated"
        }, {"name": "vCPUS", "value": "1"}, {"name": "Logs", "value": "Yes"}, {
            "name": "Max connection limit",
            "value": "75"
        }, {"name": "Memory", "value": "1 GB"}, {"name": "Migration Tool", "value": "Yes"}]
    }
};
const mySQLExample = {
    productName: "MySQL",
    "item": {
        "name": "XXS Small Space",
        "price": 17.5,
        "features": [{"name": "Backups", "value": "Daily - 7 Retained"}, {
            "name": "Max DB size",
            "value": "5 GB"
        }, {"name": "Metrics", "value": "Yes"}, {"name": "PostGIS", "value": "Yes"}, {
            "name": "Type",
            "value": "Dedicated"
        }, {"name": "vCPUS", "value": "1"}, {"name": "Logs", "value": "Yes"}, {
            "name": "Max connection limit",
            "value": "75"
        }, {"name": "Memory", "value": "1 GB"}, {"name": "Migration Tool", "value": "Yes"}]
    }
};

// The first story in the file will appear before the API table in Storybook's docs page.
// We call it the "default story" and it's used as the main presentation of your component.
// You can set several instances/items to show different situations
// but no need to get exhaustive or too detailed ;-)
export const defaultStory = makeStory(conf, {
    items: [
        {selectedProducts: []},
        {selectedProducts: [pgExample]},
        {selectedProducts: [pgExample, mySQLExample]},
    ],
});

// If your component contains remote data,
// you'll need a "skeleton screen" while the user's waiting for the data.
export const skeleton = makeStory(conf, {
    items: [{}],
});

// If your component contains remote data,
// don't forget the case where there is no data (ex: empty lists...).
export const empty = makeStory(conf, {
    items: [{three: []}],
});

// If your component contains remote data,
// don't forget the case where you have loading errors.
// If you have other kind of errors (ex: saving errors...).
// You need to name your stories with the `errorWith` prefix.
export const error = makeStory(conf, {
    items: [{error: true}],
});

// If your component contains remote data,
// try to present all the possible data combination.
// You need to name your stories with the `dataLoadedWith` prefix.
// Don't forget edge cases (ex: small/huge strings, small/huge lists...).
export const dataLoadedWithFoo = makeStory(conf, {
    items: [
        {one: 'Foo', three: [{foo: 42}]},
    ],
});

// If your component can trigger updates/deletes remote data,
// don't forget the case where the user's waiting for an operation to complete.
export const waiting = makeStory(conf, {
    items: [
        {one: 'Foo', three: [{foo: 42}], waiting: true},
    ],
});

// If your component contains remote data,
// it will have several state transitions (ex: loading => error, loading => loaded, loaded => saving...).
// When transitioning from one state to another, we try to prevent the display from "jumping" or "blinking" too much.
// Using "simulations", you can simulate several steps in time to present how your component behaves when it goes through different states.
export const simulations = makeStory(conf, {
    items: [{}, {}],
    simulations: [
        storyWait(2000, ([component, componentError]) => {
            component.three = [{foo: 42}];
            componentError.error = true;
        }),
        storyWait(1000, ([component]) => {
            component.three = [{foo: 42}, {foo: 43}];
        }),
    ],
});

// This seems a bit cumbersome but to benefit from the automatic naming of stories (with emojis, casing...),
// you need to call `enhanceStoriesNames()` with all your stories.
enhanceStoriesNames({
    defaultStory,
    skeleton,
    empty,
    error,
    dataLoadedWithFoo,
    waiting,
    simulations,
});