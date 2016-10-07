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

    switch (section) {
        case 'Main': {
            if (
                report.next_settings
                && JSON.stringify(report.next_settings)
                    !== JSON.stringify(report.settings)
            ) {
                title += 'Setting changes:\n';

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

            title += 'Price and sales:\n';

            for (let i = 0; i < report.player_count; i += 1) {
                title += report.players[i]
                    + ' - ' + target.decisions.price[i]
                    + ' * ' + target.data.orders.sold[i]
                    + ' = ' + target.data.balance.sales[i] + '\n';
            }

            title += '\n';

            title += 'Cost and profit:\n';

            for (let i = 0; i < report.player_count; i += 1) {
                title += report.players[i]
                    + ' - ' + target.data.balance.cost_before_tax[i]
                    + ', ' + target.data.balance.profit[i] + '\n';
            }

            title += '\n';

            title += 'Retained earning and MPI:\n';

            for (let i = 0; i < report.player_count; i += 1) {
                title += report.players[i]
                    + ' - ' + target.data.balance.retern[i]
                    + ', ' + target.data.mpi.mpi[i] + '\n';
            }

            title += '\n';

            part = 'decisions';
            write('Average given price', 'average_price_given');
            write('Average selling price', 'average_price');

            break;
        }
        case 'Brief': {
            target = report.data_early;

            part = 'balance';
            write('Size', 'size');

            part = 'history';
            write('Total R & D', 'history_rd');

            title += '\n';

            target = report.data;

            part = 'orders';
            write('Inventory', 'inventory');
            write('Unfilled', 'unfilled');

            part = 'balance';
            write('Sales income', 'sales');
            write('Loan', 'loan');
            write('Cash', 'cash');

            title += '\n';

            target = report.data_public.data;

            part = 'orders';
            write('Average inventory', 'average_inventory');
            write('Average unfilled', 'average_unfilled');

            part = 'balance';
            write('Average sales income', 'average_sales');

            break;
        }
        case 'Before Period': {
            target = report.data_early;

            part = 'production';
            write('Prod rate', 'prod_rate');
            write('Unit prod cost', 'prod_cost_unit');
            write('Marginal cost', 'prod_cost_marginal');
            write('Total prod cost', 'prod_cost');

            title += '\n';

            part = 'goods';
            write('Goods', 'goods');
            write('Cost of goods', 'goods_cost');
            write('Ideal sales income', 'goods_max_sales');

            title += '\n';

            part = 'balance';
            write('Deprecation', 'deprecation');
            write('Capital', 'capital');
            write('Size', 'size');
            write('Spending', 'spending');
            write('Early loan', 'loan_early');
            write('Interest', 'interest');

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
            write('Cost of inventory', 'goods_cost_inventory');

            title += '\n';

            part = 'balance';
            write('Sales income', 'sales');
            write('Cost before tax', 'cost_before_tax');
            write('Profit before tax', 'profit_before_tax');
            write('Profit', 'profit');
            write('Loan', 'loan');
            write('Cash', 'cash');
            write('Retained earning', 'retern');

            title += '\n';

            part = 'mpi';
            write('MPI', 'mpi');

            break;
        }
        case 'Industry Average': {
            target = report.data_public.data_early;

            part = 'production';
            write('Unit prod cost', 'average_prod_cost_unit');
            write('Total prod cost', 'average_prod_cost');

            title += '\n';

            part = 'goods';
            write('Goods', 'average_goods');

            title += '\n';

            part = 'balance';
            write('Capital', 'average_capital');
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
            write('Profit before tax', 'average_profit_before_tax');
            write('Profit', 'average_profit');
            write('Retained earning', 'average_retern');

            title += '\n';

            part = 'mpi';
            write('MPI', 'average_mpi');

            break;
        }
        case 'Decision': {
            target = report.next_settings.limits;

            title += 'Please submit:\n'
                + 'P Pd Mk CI RD\n'
                + '\n'
                + 'Example:\n'
                + '65 500 5000 5000 5000\n'
                + '\n'
                + 'Price - ' + target.price_min
                + ' to ' + target.price_max + '\n'
                + 'Production - 0'
                + ' to ' + report.data_early.balance.size + '\n'
                + 'Marketing - 0'
                + ' to ' + target.mk_limit + '\n'
                + 'Investment - 0'
                + ' to ' + target.ci_limit + '\n'
                + 'R & D - 0'
                + ' to ' + target.rd_limit + '\n';

            break;
        }
        default: {
            throw Error('wrong report section');
        }
    }

    return title;
};
