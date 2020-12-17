const test = require('ava');
const { Elections } = require('./elections');

test('election without districts', t => {
    const list = {
        'District 1': ['Bob', 'Anna', 'Jess', 'July'],
        'District 2': ['Jerry', 'Simon'],
        'District 3': ['Johnny', 'Matt', 'Carole'],
    };

    const elections = new Elections(list, false);
    elections.addCandidate('Michel');
    elections.addCandidate('Jerry');
    elections.addCandidate('Johnny');

    elections.voteFor('Bob', 'Jerry', 'District 1');
    elections.voteFor('Jerry', 'Jerry', 'District 2');
    elections.voteFor('Anna', 'Johnny', 'District 1');
    elections.voteFor('Johnny', 'Johnny', 'District 3');
    elections.voteFor('Matt', 'Donald', 'District 3');
    elections.voteFor('Jess', 'Joe', 'District 1');
    elections.voteFor('Simon', '', 'District 2');
    elections.voteFor('Carole', '', 'District 3');

    const results = elections.results();
    const expectedResults = {
        Jerry: '50,00%',
        Johnny: '50,00%',
        Michel: '0,00%',
        Blank: '25,00%',
        Null: '25,00%',
        Abstention: '11,11%',
    };

    t.deepEqual(results, expectedResults);
    /*
        Elections elections = new Elections(list, false);
        elections.addCandidate("Michel");
        elections.addCandidate("Jerry");
        elections.addCandidate("Johnny");

        elections.voteFor("Bob", "Jerry", "District 1");
        elections.voteFor("Jerry", "Jerry", "District 2");
        elections.voteFor("Anna", "Johnny", "District 1");
        elections.voteFor("Johnny", "Johnny", "District 3");
        elections.voteFor("Matt", "Donald", "District 3");
        elections.voteFor("Jess", "Joe", "District 1");
        elections.voteFor("Simon", "", "District 2");
        elections.voteFor("Carole", "", "District 3");

        Map<String, String> results = elections.results();

        Map<String, String> expectedResults = new HashMap<>();
        expectedResults.put("Jerry", "50,00%");
        expectedResults.put("Johnny", "50,00%");
        expectedResults.put("Michel", "0,00%");
        expectedResults.put("Blank", "25,00%");
        expectedResults.put("Null", "25,00%");
        expectedResults.put("Abstention", "11,11%");
    Assertions.assertThat(results).isEqualTo(expectedResults);
    */
});
