import random
import string

# 28 exchange rates (mirrors Exp1's 28 probability levels)
EXCHANGE_RATES = [
    1.01, 1.02, 1.03, 1.05, 1.07, 1.10, 1.13, 1.17, 1.20, 1.25,
    1.30, 1.35, 1.40, 1.45, 1.50, 1.55, 1.60, 1.70, 1.80, 1.90,
    2.00, 2.20, 2.50, 3.00, 3.50, 4.00, 5.00, 7.00,
]

# Fixed stake — matches Exp1's ¥1,000 prize
STAKE = 1000

# 20 today-amounts: ¥50 to ¥1,000 in ¥50 steps
TODAY_AMOUNTS = [50 * i for i in range(1, 21)]

DELAYS = {
    "1week":  "1週間後",
    "1month": "1ヶ月後",
    "3months": "3ヶ月後",
}

DIGIT_CHANGE_EVERY = 3  # new 7-digit string every N blocks


def make_digit_string() -> str:
    first = random.choice("123456789")
    rest = "".join(random.choices(string.digits, k=6))
    return first + rest


def generate_digit_strings(n_blocks: int) -> list[str]:
    strings = []
    current = ""
    for i in range(n_blocks):
        if i % DIGIT_CHANGE_EVERY == 0:
            current = make_digit_string()
        strings.append(current)
    return strings


def generate_mpl_trials(delay_condition: str) -> list[dict]:
    """28 exchange rates × 20 today-amounts = 28 blocks of MPL rows.
    Each block: fixed future_amount = STAKE × exchange_rate,
    today_amounts vary from ¥50 to ¥1,000 (20 rows).
    Block order is randomised.
    """
    rates = EXCHANGE_RATES.copy()
    random.shuffle(rates)

    trials = []
    for block_idx, rate in enumerate(rates):
        future_amount = round(STAKE * rate)
        for row_idx, today_amount in enumerate(TODAY_AMOUNTS):
            trials.append({
                "block": block_idx + 1,
                "exchange_rate": rate,
                "future_amount": future_amount,
                "row": row_idx + 1,
                "today_amount": today_amount,
                "delay": delay_condition,
                "delay_label": DELAYS[delay_condition],
            })
    return trials
