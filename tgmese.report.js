'use strict';

module.exports = (report, section) => {
    let title = 'Period ' + (report.now_period - 1)
        + ' - ' + section + '\n'
        + '\n';

    let target = {}; // notice: unnecessary init
    let part = ''; // notice: unnecessary init

    const write = (name, item) => {
        title += name
            + ' - ' + target[part][item] + '\n';
    };

    // TODO: report.status

    switch (section) {
        case 'Main': {
            if (
                report.next_settings
                && JSON.stringify(report.next_settings)
                    !== JSON.stringify(report.settings)
            ) {
                title += 'Setting changes in next period:\n';

                const writeSetting = (name, item) => {
                    if (
                        target[part][item]
                        !== report.settings[part][item]
                    ) {
                        write(name, item);
                    }
                };

                target = report.next_settings;

                part = 'limits';
                writeSetting('Max price', 'price_max');
                writeSetting('Min price', 'price_min');
                writeSetting('Max marketing', 'mk_limit');
                writeSetting('Max investment', 'ci_limit');
                writeSetting('Max R & D', 'rd_limit');
                writeSetting('Max loan', 'loan_limit');

                part = 'production';
                writeSetting('Balanced prod rate', 'prod_rate_balanced');
                writeSetting('Unit fee', 'unit_fee');
                writeSetting('Deprecation rate', 'deprecation_rate');

                part = 'balance';
                writeSetting('Interest rate (cash)', 'interest_rate_cash');
                writeSetting('Interest rate (loan)', 'interest_rate_loan');
                writeSetting('Inventory fee', 'inventory_fee');
                writeSetting('Tax rate', 'tax_rate');

                title += '\n';
            }

            target = report.data_public;

            part = 'decisions';
            write('Average price', 'average_price');

            target = report.data_public.data;

            part = 'mpi';
            write('Average MPI', 'average_mpi');

            title += '\n';

            if (report.next_settings) {
                title += 'Please submit your decision as:\n'
                    + '<P> <Pd> <Mk> <CI> <RD>\n'
                    + 'Example:\n'
                    + '65 500 5000 5000 5000\n';
            } else {
                title += 'Game finished\n';
            }

            break;
        }
        case 'Before Period': {
            target = report.data_early;

            part = 'production';
            write('Prod rate', 'prod_rate');
            write('Unit prod cost', 'prod_cost_unit');
            write('Marginal cost', 'prod_cost_marginal');

            title += '\n';

            part = 'goods';
            write('Goods', 'goods');
            write('Cost of goods', 'goods_cost');
            write('Ideal sales income', 'goods_max_sales');

            title += '\n';

            part = 'balance';
            write('Size', 'size');
            write('Spending', 'spending');
            write('Cash / loan', 'balance_early');

            title += '\n';

            part = 'history';
            write('Total R & D', 'history_rd');

            break;
        }
        case 'After Period': {
            target = report.data;

            part = 'orders';
            write('Orders', 'orders');
            write('Unit sold', 'sold');
            write('Inventory', 'inventory');
            write('Unfilled', 'unfilled');

            title += '\n';

            part = 'goods';
            write('Cost of goods sold', 'goods_cost_sold');

            title += '\n';

            part = 'balance';
            write('Sales income', 'sales');
            write('Cost before tax', 'cost_before_tax');
            write('Profit', 'profit');
            write('Loan', 'loan');
            write('Cash', 'cash');
            write('Retained earning', 'retern');

            break;
        }
        case 'Industry Average': {
            target = report.data_public.data_early;

            part = 'production';
            write('Prod cost', 'average_prod_cost_unit');

            part = 'goods';
            write('Goods', 'average_goods');

            part = 'balance';
            write('Size', 'average_size');

            title += '\n';

            target = report.data_public.data;

            part = 'orders';
            write('Orders', 'average_orders');
            write('Unit sold', 'average_sold');
            write('Inventory', 'average_inventory');
            write('Unfilled', 'average_unfilled');

            title += '\n';

            part = 'goods';
            write('Cost of goods sold', 'average_goods_cost_sold');

            title += '\n';

            part = 'balance';
            write('Sales income', 'average_sales');
            write('Cost before tax', 'average_cost_before_tax');
            write('Profit', 'average_profit');
            write('Retained earning', 'average_retern');

            break;
        }
        default: {
            throw 1;
        }
    }

    return title;
};
